-- ============================================================================
-- CareSync (Noon) — Phase 1 Supabase Database Schema, RBAC & Audit Ledger
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE care_role AS ENUM ('ELDER', 'CHILD', 'CARETAKER', 'DOCTOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE dose_status AS ENUM (
        'SCHEDULED', 
        'SENSOR_VERIFIED', 
        'CARETAKER_SUBMITTED', 
        'DUAL_VERIFIED', 
        'MISSED', 
        'PRE_DISPENSED_TRAVEL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_method AS ENUM ('IOT_BOX', 'PHOTO_2FA', 'MANUAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Patient Profiles
CREATE TABLE IF NOT EXISTS patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    age INT NOT NULL CHECK (age >= 0),
    abha_id TEXT UNIQUE,
    emergency_threshold INT NOT NULL DEFAULT 2,
    travel_mode_active BOOLEAN NOT NULL DEFAULT FALSE,
    travel_mode_until TIMESTAMPTZ,
    preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'ta', 'hi')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Care Role Access (Multi-role passcode store)
CREATE TABLE IF NOT EXISTS care_role_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    role care_role NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    passcode_hash TEXT NOT NULL,
    shift_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Medications
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    schedule_time TIME NOT NULL,
    meal_instruction TEXT NOT NULL CHECK (meal_instruction IN ('before_food', 'after_food', 'with_food', 'any_time')),
    iot_slot_number INT NOT NULL CHECK (iot_slot_number BETWEEN 1 AND 4),
    consecutive_misses INT NOT NULL DEFAULT 0,
    max_consecutive_misses INT NOT NULL DEFAULT 2,
    remaining_pills INT NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Dose Logs (With direct patient_id and caretaker_id tracking)
CREATE TABLE IF NOT EXISTS dose_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    caretaker_id UUID REFERENCES care_role_access(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    status dose_status NOT NULL DEFAULT 'SCHEDULED',
    verification_method verification_method,
    photo_proof_url TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    date_time TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED', 'COMPLETED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Medical Bills
CREATE TABLE IF NOT EXISTS medical_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL CHECK (category IN ('medication', 'consultation', 'lab_test', 'hospital', 'other')),
    receipt_url TEXT,
    uploaded_by_role care_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Emergency Alerts (Deduplication & Active Banner Management)
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    consecutive_misses INT NOT NULL,
    alert_message TEXT NOT NULL,
    acknowledged_by TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Centralized Audit Log (Append-Only Ledger)
CREATE TABLE IF NOT EXISTS central_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    actor_name TEXT NOT NULL,
    actor_role care_role NOT NULL,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce Immutability on central_audit_logs (Block UPDATE and DELETE)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit Log Integrity Violation: Modifications or deletions to central_audit_logs are strictly prohibited.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_audit_logs ON central_audit_logs;
CREATE TRIGGER trg_immutable_audit_logs
BEFORE UPDATE OR DELETE ON central_audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- 10. Enable Supabase Realtime CDC publication
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE dose_logs, central_audit_logs, emergency_alerts, medications;
EXCEPTION
    WHEN others THEN null;
END $$;

-- ============================================================================
-- SEED DATA: Localized Indian Healthcare Personas & Demo Scenarios
-- ============================================================================

-- Seed Patient: Sundaram Iyer
INSERT INTO patient_profiles (id, name, age, abha_id, emergency_threshold, travel_mode_active, preferred_language)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'Sundaram Iyer',
    74,
    '91-4567-8901-2345',
    2,
    FALSE,
    'en'
) ON CONFLICT (id) DO NOTHING;

-- Seed 4 Roles:
-- Elder: Sundaram (PIN: 1234)
INSERT INTO care_role_access (id, patient_id, role, name, email, phone, passcode_hash)
VALUES (
    'b1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'ELDER',
    'Sundaram Iyer',
    'sundaram.iyer@example.in',
    '+91 98401 23456',
    '1234'
) ON CONFLICT (id) DO NOTHING;

-- Child / Admin: Karthik Sundaram (Passcode: 654321)
INSERT INTO care_role_access (id, patient_id, role, name, email, phone, passcode_hash)
VALUES (
    'b2222222-2222-2222-2222-222222222222',
    'a1111111-1111-1111-1111-111111111111',
    'CHILD',
    'Karthik Sundaram',
    'karthik.sundaram@example.in',
    '+91 98840 98765',
    '654321'
) ON CONFLICT (id) DO NOTHING;

-- Caretaker: Ramesh Kumar (Shift PIN: 987654, Valid till 18:00 today)
INSERT INTO care_role_access (id, patient_id, role, name, email, phone, passcode_hash, shift_expires_at)
VALUES (
    'b3333333-3333-3333-3333-333333333333',
    'a1111111-1111-1111-1111-111111111111',
    'CARETAKER',
    'Ramesh Kumar',
    'ramesh.care@example.in',
    '+91 97100 11223',
    '987654',
    NOW() + INTERVAL '8 hours'
) ON CONFLICT (id) DO NOTHING;

-- Doctor: Dr. Priya Nair (Passcode: DOC-4481)
INSERT INTO care_role_access (id, patient_id, role, name, email, phone, passcode_hash)
VALUES (
    'b4444444-4444-4444-4444-444444444444',
    'a1111111-1111-1111-1111-111111111111',
    'DOCTOR',
    'Dr. Priya Nair',
    'dr.priya.nair@apollo-hospital.in',
    '+91 94440 55667',
    'DOC-4481'
) ON CONFLICT (id) DO NOTHING;

-- Seed Medications (Mapped to 4 IoT Box Slots):
-- Slot 1: Amlodipine 5mg (13:00 / Noon - after lunch)
INSERT INTO medications (id, patient_id, name, dosage, schedule_time, meal_instruction, iot_slot_number, consecutive_misses, max_consecutive_misses, remaining_pills)
VALUES (
    'c1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'Amlodipine',
    '5 mg · 1 capsule',
    '13:00:00',
    'after_food',
    1,
    0,
    2,
    28
) ON CONFLICT (id) DO NOTHING;

-- Slot 2: Metformin 500mg (08:00 / Morning - after breakfast)
INSERT INTO medications (id, patient_id, name, dosage, schedule_time, meal_instruction, iot_slot_number, consecutive_misses, max_consecutive_misses, remaining_pills)
VALUES (
    'c2222222-2222-2222-2222-222222222222',
    'a1111111-1111-1111-1111-111111111111',
    'Metformin',
    '500 mg · 1 tablet',
    '08:00:00',
    'after_food',
    2,
    0,
    2,
    45
) ON CONFLICT (id) DO NOTHING;

-- Slot 3: Atorvastatin 10mg (20:00 / Night - after dinner)
INSERT INTO medications (id, patient_id, name, dosage, schedule_time, meal_instruction, iot_slot_number, consecutive_misses, max_consecutive_misses, remaining_pills)
VALUES (
    'c3333333-3333-3333-3333-333333333333',
    'a1111111-1111-1111-1111-111111111111',
    'Atorvastatin',
    '10 mg · 1 tablet',
    '20:00:00',
    'after_food',
    3,
    0,
    2,
    14
) ON CONFLICT (id) DO NOTHING;

-- Slot 4: Vitamin D3 60K (Morning weekly / daily supplement)
INSERT INTO medications (id, patient_id, name, dosage, schedule_time, meal_instruction, iot_slot_number, consecutive_misses, max_consecutive_misses, remaining_pills)
VALUES (
    'c4444444-4444-4444-4444-444444444444',
    'a1111111-1111-1111-1111-111111111111',
    'Vitamin D3',
    '60,000 IU · 1 capsule',
    '08:00:00',
    'with_food',
    4,
    0,
    1,
    8
) ON CONFLICT (id) DO NOTHING;

-- Seed Dose Logs for Today:
INSERT INTO dose_logs (id, patient_id, medication_id, scheduled_at, status, verification_method, verified_at)
VALUES 
(
    gen_random_uuid(),
    'a1111111-1111-1111-1111-111111111111',
    'c2222222-2222-2222-2222-222222222222',
    CURRENT_DATE + TIME '08:00:00',
    'SENSOR_VERIFIED',
    'IOT_BOX',
    CURRENT_DATE + TIME '08:04:12'
),
(
    gen_random_uuid(),
    'a1111111-1111-1111-1111-111111111111',
    'c4444444-4444-4444-4444-444444444444',
    CURRENT_DATE + TIME '08:00:00',
    'DUAL_VERIFIED',
    'PHOTO_2FA',
    CURRENT_DATE + TIME '08:15:30'
),
(
    gen_random_uuid(),
    'a1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    CURRENT_DATE + TIME '13:00:00',
    'SCHEDULED',
    NULL,
    NULL
);

-- Seed Appointments:
INSERT INTO appointments (id, patient_id, doctor_name, specialty, date_time, location, notes, status)
VALUES (
    gen_random_uuid(),
    'a1111111-1111-1111-1111-111111111111',
    'Dr. Priya Nair',
    'Cardiology Follow-up',
    NOW() + INTERVAL '3 days',
    'Apollo Speciality Hospital, T. Nagar, Chennai',
    'Review BP trends and adjust Amlodipine dosage if systolic < 130.',
    'CONFIRMED'
);

-- Seed Medical Bills:
INSERT INTO medical_bills (id, patient_id, title, amount, category, uploaded_by_role, receipt_url)
VALUES 
(
    gen_random_uuid(),
    'a1111111-1111-1111-1111-111111111111',
    'MedPlus Pharmacy - Monthly Refill',
    1450.00,
    'medication',
    'CHILD',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500'
),
(
    gen_random_uuid(),
    'a1111111-1111-1111-1111-111111111111',
    'Comprehensive Lipid Profile & HbA1c Lab Test',
    1800.00,
    'lab_test',
    'CHILD',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500'
);

-- Seed Central Audit Logs:
INSERT INTO central_audit_logs (patient_id, actor_name, actor_role, action_type, description, previous_value, new_value)
VALUES 
(
    'a1111111-1111-1111-1111-111111111111',
    'Dr. Priya Nair',
    'DOCTOR',
    'PRESCRIPTION_UPDATED',
    'Adjusted Amlodipine schedule time from 14:00 to 13:00 (after lunch).',
    '{"schedule_time": "14:00:00"}'::jsonb,
    '{"schedule_time": "13:00:00"}'::jsonb
),
(
    'a1111111-1111-1111-1111-111111111111',
    'IoT Pillbox Controller (ESP32)',
    'ELDER',
    'SENSOR_DOSE_DISPENSED',
    'Slot 2 (Metformin 500mg) lid opened and pill lifted. Dose marked SENSOR_VERIFIED.',
    '{"status": "SCHEDULED"}'::jsonb,
    '{"status": "SENSOR_VERIFIED"}'::jsonb
),
(
    'a1111111-1111-1111-1111-111111111111',
    'Ramesh Kumar',
    'CARETAKER',
    'CARETAKER_DOSE_SUBMITTED',
    'Submitted photo 2FA proof for Vitamin D3 morning dose. Status upgraded to DUAL_VERIFIED.',
    '{"status": "SCHEDULED"}'::jsonb,
    '{"status": "DUAL_VERIFIED"}'::jsonb
),
(
    'a1111111-1111-1111-1111-111111111111',
    'Karthik Sundaram',
    'CHILD',
    'ABHA_SYNC_REQUESTED',
    'Synchronized patient health profile with ABHA Health ID 91-4567-8901-2345.',
    null,
    '{"abha_status": "VERIFIED_ACTIVE"}'::jsonb
);
