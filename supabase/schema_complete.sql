-- ============================================================================
-- CareSync (Noon) — Complete Production Database Schema for Supabase
-- Copy and paste this entire script into your Supabase SQL Editor and run it.
-- ============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-running (Clean slate)
DROP TABLE IF EXISTS central_audit_logs CASCADE;
DROP TABLE IF EXISTS care_linking_requests CASCADE;
DROP TABLE IF EXISTS emergency_alerts CASCADE;
DROP TABLE IF EXISTS medical_bills CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS dose_logs CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS care_role_access CASCADE;
DROP TABLE IF EXISTS patient_profiles CASCADE;

-- 3. Create Custom Enums
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

-- ============================================================================
-- 4. Tables Definition
-- ============================================================================

-- Table 1: Patient Profiles (Elderly Patients)
CREATE TABLE patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    age INT NOT NULL CHECK (age >= 0),
    abha_id TEXT UNIQUE,
    abha_address TEXT UNIQUE, -- e.g. sundaram.iyer@sbx
    emergency_threshold INT NOT NULL DEFAULT 2,
    travel_mode_active BOOLEAN NOT NULL DEFAULT FALSE,
    travel_mode_until TIMESTAMPTZ,
    preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'ta', 'hi')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 2: Care Role Access (Multi-Role Auth Store)
CREATE TABLE care_role_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    role care_role NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    auth_provider TEXT NOT NULL DEFAULT 'google' CHECK (auth_provider IN ('phone_otp', 'google', 'passcode')),
    google_id TEXT,
    passcode_hash TEXT, -- Quick tactile PIN for Elder, or passkey
    shift_expires_at TIMESTAMPTZ, -- Time-bound shift expiry for Caretakers
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 3: Medications (Mapped to 4 IoT Hardware Slots)
CREATE TABLE medications (
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

-- Table 4: Dose Logs
CREATE TABLE dose_logs (
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

-- Table 5: Appointments
CREATE TABLE appointments (
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

-- Table 6: Medical Bills & Receipts
CREATE TABLE medical_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL CHECK (category IN ('medication', 'consultation', 'lab_test', 'hospital', 'other')),
    receipt_url TEXT,
    uploaded_by_role care_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 7: Emergency Escalation Alerts (Deduplicated)
CREATE TABLE emergency_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    consecutive_misses INT NOT NULL,
    alert_message TEXT NOT NULL,
    acknowledged_by TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 8: Care Linking Requests (LinkedIn-Style Elder Consent Center)
CREATE TABLE care_linking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES care_role_access(id) ON DELETE CASCADE,
    requester_name TEXT NOT NULL,
    requester_role care_role NOT NULL,
    requester_phone TEXT,
    requester_email TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- Table 9: Central Audit Logs (Append-Only Tamper-Evident Ledger)
CREATE TABLE central_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. Immutability Enforcement (Triggers)
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Security Policy Violation: central_audit_logs is append-only. Modifying or deleting audit records is strictly prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_immutable_audit_logs
BEFORE UPDATE OR DELETE ON central_audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- Enable Supabase Realtime CDC publication on critical tables
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE dose_logs, central_audit_logs, emergency_alerts, medications, care_linking_requests;
EXCEPTION
    WHEN others THEN null;
END $$;

-- ============================================================================
-- 6. Initial Seed Data (Production Demo State)
-- ============================================================================

-- Seed Elder Patient: Sundaram Iyer
INSERT INTO patient_profiles (id, name, phone, age, abha_id, abha_address, emergency_threshold, travel_mode_active, preferred_language)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'Sundaram Iyer',
    '9840123456',
    74,
    '91-4567-8901-2345',
    'sundaram.iyer@sbx',
    2,
    FALSE,
    'en'
);

-- Seed Care Role Access Records:
-- 1. Elder: Sundaram Iyer (Phone OTP or Google OAuth, PIN: 1234)
INSERT INTO care_role_access (id, patient_id, role, name, email, phone, auth_provider, passcode_hash)
VALUES (
    'b1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'ELDER',
    'Sundaram Iyer',
    'sundaram.iyer@gmail.com',
    '9840123456',
    'phone_otp',
    '1234'
);

-- 2. Child: Karthik Sundaram (Google OAuth)
INSERT INTO care_role_access (id, patient_id, role, name, email, phone, auth_provider, passcode_hash)
VALUES (
    'b2222222-2222-2222-2222-222222222222',
    'a1111111-1111-1111-1111-111111111111',
    'CHILD',
    'Karthik Sundaram',
    'karthik.sundaram@gmail.com',
    '9884098765',
    'google',
    '654321'
);

-- 3. Caretaker: Ramesh Kumar (Google OAuth + Time-bound shift)
INSERT INTO care_role_access (id, patient_id, role, name, email, phone, auth_provider, passcode_hash, shift_expires_at)
VALUES (
    'b3333333-3333-3333-3333-333333333333',
    'a1111111-1111-1111-1111-111111111111',
    'CARETAKER',
    'Ramesh Kumar',
    'ramesh.caregiver@gmail.com',
    '9710011223',
    'google',
    '987654',
    NOW() + INTERVAL '8 hours'
);

-- 4. Doctor: Dr. Priya Nair (Google OAuth / Medical Council verification)
INSERT INTO care_role_access (id, patient_id, role, name, email, phone, auth_provider, passcode_hash)
VALUES (
    'b4444444-4444-4444-4444-444444444444',
    'a1111111-1111-1111-1111-111111111111',
    'DOCTOR',
    'Dr. Priya Nair',
    'dr.priya.nair@apollo-hospital.in',
    '9444055667',
    'google',
    'DOC-4481'
);

-- Seed 4 Medications Mapped to IoT Box Slots:
INSERT INTO medications (id, patient_id, name, dosage, schedule_time, meal_instruction, iot_slot_number, consecutive_misses, max_consecutive_misses, remaining_pills)
VALUES 
('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Amlodipine', '5 mg · 1 capsule', '13:00:00', 'after_food', 1, 0, 2, 28),
('c2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Metformin', '500 mg · 1 tablet', '08:00:00', 'after_food', 2, 0, 2, 45),
('c3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Atorvastatin', '10 mg · 1 tablet', '20:00:00', 'after_food', 3, 0, 2, 14),
('c4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'Vitamin D3', '60,000 IU · 1 capsule', '08:00:00', 'with_food', 4, 0, 1, 8);

-- Seed Initial Dose Logs for Today:
INSERT INTO dose_logs (patient_id, medication_id, scheduled_at, status, verification_method, verified_at)
VALUES 
('a1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', CURRENT_DATE + TIME '08:00:00', 'SENSOR_VERIFIED', 'IOT_BOX', CURRENT_DATE + TIME '08:04:12'),
('a1111111-1111-1111-1111-111111111111', 'c4444444-4444-4444-4444-444444444444', CURRENT_DATE + TIME '08:00:00', 'DUAL_VERIFIED', 'PHOTO_2FA', CURRENT_DATE + TIME '08:15:30'),
('a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', CURRENT_DATE + TIME '13:00:00', 'SCHEDULED', NULL, NULL);

-- Seed Initial Appointments:
INSERT INTO appointments (patient_id, doctor_name, specialty, date_time, location, notes, status)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'Dr. Priya Nair',
    'Cardiology Follow-up',
    NOW() + INTERVAL '3 days',
    'Apollo Speciality Hospital, T. Nagar, Chennai',
    'Review BP trends and adjust Amlodipine dosage if systolic < 130.',
    'CONFIRMED'
);

-- Seed Initial Medical Bills:
INSERT INTO medical_bills (patient_id, title, amount, category, uploaded_by_role, receipt_url)
VALUES 
('a1111111-1111-1111-1111-111111111111', 'MedPlus Pharmacy - Monthly Refill', 1450.00, 'medication', 'CHILD', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500'),
('a1111111-1111-1111-1111-111111111111', 'Comprehensive Lipid Profile & HbA1c Lab Test', 1800.00, 'lab_test', 'CHILD', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500');

-- Seed Care Linking Requests:
INSERT INTO care_linking_requests (patient_id, requester_id, requester_name, requester_role, requester_phone, message, status)
VALUES 
('a1111111-1111-1111-1111-111111111111', 'b4444444-4444-4444-4444-444444444444', 'Dr. Priya Nair', 'DOCTOR', '9444055667', 'Requesting clinical access to review vital signs and update prescriptions.', 'ACCEPTED'),
('a1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 'Ramesh Kumar', 'CARETAKER', '9710011223', 'Registered for daily 8-hour medication duty & meal assistance.', 'ACCEPTED');

-- Seed Central Audit Logs:
INSERT INTO central_audit_logs (patient_id, actor_name, actor_role, action_type, description, previous_value, new_value)
VALUES 
('a1111111-1111-1111-1111-111111111111', 'Dr. Priya Nair', 'DOCTOR', 'PRESCRIPTION_UPDATED', 'Adjusted Amlodipine schedule time from 14:00 to 13:00 (after lunch).', '{"schedule_time": "14:00:00"}'::jsonb, '{"schedule_time": "13:00:00"}'::jsonb),
('a1111111-1111-1111-1111-111111111111', 'IoT Pillbox (ESP32 Slot 2)', 'IOT_DEVICE', 'SENSOR_DOSE_DISPENSED', 'Slot 2 (Metformin 500mg) lid opened and pill lifted. Status marked SENSOR_VERIFIED.', '{"status": "SCHEDULED"}'::jsonb, '{"status": "SENSOR_VERIFIED"}'::jsonb),
('a1111111-1111-1111-1111-111111111111', 'Ramesh Kumar', 'CARETAKER', 'CARETAKER_DOSE_SUBMITTED', 'Submitted photo 2FA proof for Vitamin D3 morning dose. Upgraded to DUAL_VERIFIED.', '{"status": "SCHEDULED"}'::jsonb, '{"status": "DUAL_VERIFIED"}'::jsonb),
('a1111111-1111-1111-1111-111111111111', 'Sundaram Iyer', 'ELDER', 'LINKING_REQUEST_ACCEPTED', 'Elder Sundaram accepted Dr. Priya Nair into his Care Circle.', '{"status": "PENDING"}'::jsonb, '{"status": "ACCEPTED"}'::jsonb);
