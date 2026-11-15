-- ============================================================================
-- CareSync (Noon) — Complete Production Database Schema for Supabase
-- Run this complete script in your Supabase SQL Editor.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean slate
DROP TABLE IF EXISTS central_audit_logs CASCADE;
DROP TABLE IF EXISTS care_linking_requests CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS abha_health_records CASCADE;
DROP TABLE IF EXISTS emergency_alerts CASCADE;
DROP TABLE IF EXISTS medical_bills CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS dose_logs CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS care_role_access CASCADE;
DROP TABLE IF EXISTS patient_profiles CASCADE;

-- Enums
DO $$ BEGIN
    CREATE TYPE care_role AS ENUM ('ELDER', 'CHILD', 'CARETAKER', 'DOCTOR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE dose_status AS ENUM (
        'SCHEDULED', 
        'SENSOR_VERIFIED', 
        'CARETAKER_SUBMITTED', 
        'DUAL_VERIFIED', 
        'MISSED', 
        'PRE_DISPENSED_TRAVEL'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE verification_method AS ENUM ('IOT_BOX', 'PHOTO_2FA', 'MANUAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. Patient Profiles (Elderly Patients)
CREATE TABLE patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE, -- Primary lookup for Care Circle linking
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
CREATE INDEX idx_patient_phone ON patient_profiles(phone);

-- 2. Care Role Access (Multi-Role Store)
CREATE TABLE care_role_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    role care_role NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    auth_provider TEXT NOT NULL DEFAULT 'google' CHECK (auth_provider IN ('phone_otp', 'google', 'passcode')),
    google_id TEXT,
    passcode_hash TEXT,
    shift_expires_at TIMESTAMPTZ,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Medications (4 Compartments Mapped to IoT Box)
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

-- 4. Dose Logs
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

-- 5. Appointments
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

-- 6. Medical Bills & Receipts with OCR
CREATE TABLE medical_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL CHECK (category IN ('medication', 'consultation', 'lab_test', 'hospital', 'other')),
    receipt_url TEXT,
    receipt_image_base64 TEXT, -- Stores image directly in database
    extracted_ocr_text TEXT, -- Text extracted via OCR engine
    uploaded_by_role care_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Prescriptions with OCR Storage
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    uploaded_by_role care_role NOT NULL,
    doctor_name TEXT,
    hospital_name TEXT,
    prescription_date DATE DEFAULT CURRENT_DATE,
    image_url TEXT,
    image_base64 TEXT, -- Full prescription image stored in DB
    extracted_text TEXT NOT NULL, -- Extracted medicines and instructions from OCR
    ocr_status TEXT DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ABDM Official Health Records (NHA Sandbox Sync)
CREATE TABLE abha_health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL, -- 'Prescription', 'Diagnostic Report', 'OPD Consultation'
    facility_name TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    record_date DATE NOT NULL,
    document_url TEXT,
    document_base64 TEXT,
    extracted_clinical_notes TEXT,
    consent_granted BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Care Linking Requests (LinkedIn-Style Phone Search & Connection)
CREATE TABLE care_linking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES care_role_access(id) ON DELETE CASCADE,
    requester_name TEXT NOT NULL,
    requester_role care_role NOT NULL,
    requester_phone TEXT,
    requester_email TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);
CREATE INDEX idx_linking_patient ON care_linking_requests(patient_id);

-- 10. Emergency Escalation Alerts
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

-- 11. Central Audit Logs (Append-Only Tamper-Evident Ledger)
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

-- Immutability Trigger on Audit Logs
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Security Policy Violation: central_audit_logs is append-only. Modifying or deleting audit records is strictly prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_immutable_audit_logs
BEFORE UPDATE OR DELETE ON central_audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- Enable Realtime publication
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE dose_logs, central_audit_logs, emergency_alerts, medications, care_linking_requests, prescriptions;
EXCEPTION WHEN others THEN null; END $$;

-- ============================================================================
-- Seed Initial Production Patient & Data
-- ============================================================================
INSERT INTO patient_profiles (id, name, phone, age, abha_id, abha_address, emergency_threshold, travel_mode_active)
VALUES ('a1111111-1111-1111-1111-111111111111', 'Sundaram Iyer', '9840123456', 74, '91-4567-8901-2345', 'sundaram.iyer@sbx', 2, FALSE);

INSERT INTO care_role_access (id, patient_id, role, name, email, phone, auth_provider, passcode_hash)
VALUES 
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'ELDER', 'Sundaram Iyer', 'sundaram.iyer@gmail.com', '9840123456', 'phone_otp', '1234'),
('b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'CHILD', 'Karthik Sundaram', 'karthik.sundaram@gmail.com', '9884098765', 'google', '654321'),
('b3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'CARETAKER', 'Ramesh Kumar', 'ramesh.caregiver@gmail.com', '9710011223', 'google', '987654'),
('b4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'DOCTOR', 'Dr. Priya Nair', 'dr.priya.nair@apollo-hospital.in', '9444055667', 'google', 'DOC-4481');

INSERT INTO medications (id, patient_id, name, dosage, schedule_time, meal_instruction, iot_slot_number, remaining_pills)
VALUES 
('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Amlodipine', '5 mg · 1 capsule', '13:00:00', 'after_food', 1, 28),
('c2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Metformin', '500 mg · 1 tablet', '08:00:00', 'after_food', 2, 45),
('c3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Atorvastatin', '10 mg · 1 tablet', '20:00:00', 'after_food', 3, 14),
('c4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'Vitamin D3', '60,000 IU · 1 capsule', '08:00:00', 'with_food', 4, 8);

INSERT INTO dose_logs (patient_id, medication_id, scheduled_at, status, verification_method, verified_at)
VALUES 
('a1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', CURRENT_DATE + TIME '08:00:00', 'SENSOR_VERIFIED', 'IOT_BOX', CURRENT_DATE + TIME '08:04:12'),
('a1111111-1111-1111-1111-111111111111', 'c4444444-4444-4444-4444-444444444444', CURRENT_DATE + TIME '08:00:00', 'DUAL_VERIFIED', 'PHOTO_2FA', CURRENT_DATE + TIME '08:15:30'),
('a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', CURRENT_DATE + TIME '13:00:00', 'SCHEDULED', NULL, NULL);

-- Seed initial OCR prescription
INSERT INTO prescriptions (patient_id, uploaded_by_role, doctor_name, hospital_name, extracted_text)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'DOCTOR',
    'Dr. Priya Nair (Cardiologist)',
    'Apollo Speciality Hospital, Chennai',
    'Rx: 1. Tab. Amlodipine 5mg - 1 OD (13:00 post lunch)
2. Tab. Metformin 500mg - 1 BD (08:00 post breakfast)
3. Tab. Atorvastatin 10mg - 1 HS (20:00 post dinner)
BP Target: < 130/80 mmHg. Monitor for peripheral edema.'
);

-- Seed ABDM Records
INSERT INTO abha_health_records (patient_id, record_type, facility_name, doctor_name, record_date, extracted_clinical_notes)
VALUES 
('a1111111-1111-1111-1111-111111111111', 'Diagnostic Lab Report', 'Dr. Lal PathLabs, Chennai', 'Dr. R. Venkatraman', CURRENT_DATE - 5, 'Comprehensive Lipid Profile: Total Cholesterol 185 mg/dL, LDL 102 mg/dL, Triglycerides 140 mg/dL. HbA1c: 6.4% (Good Glycemic Control).'),
('a1111111-1111-1111-1111-111111111111', 'Cardiology Clinical Note', 'Apollo Heart Centre', 'Dr. Priya Nair', CURRENT_DATE - 12, 'Echocardiogram: Normal LV systolic function, EF 62%. Continue current antihypertensive regimen.');
