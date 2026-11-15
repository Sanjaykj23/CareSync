export type CareRole = 'ELDER' | 'CHILD' | 'CARETAKER' | 'DOCTOR';

export type DoseStatus = 
  | 'SCHEDULED' 
  | 'SENSOR_VERIFIED' 
  | 'CARETAKER_SUBMITTED' 
  | 'DUAL_VERIFIED' 
  | 'MISSED' 
  | 'PRE_DISPENSED_TRAVEL';

export type VerificationMethod = 'IOT_BOX' | 'PHOTO_2FA' | 'MANUAL';

export type MealInstruction = 'before_food' | 'after_food' | 'with_food' | 'any_time';

export type Language = 'en' | 'ta' | 'hi';

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  abha_id: string;
  emergency_threshold: number;
  travel_mode_active: boolean;
  travel_mode_until: string | null;
  preferred_language: Language;
  created_at: string;
  updated_at: string;
}

export interface CareRoleAccess {
  id: string;
  patient_id: string;
  role: CareRole;
  name: string;
  email: string | null;
  phone: string | null;
  passcode_hash: string;
  shift_expires_at: string | null;
  created_at: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  schedule_time: string; // HH:mm:ss
  meal_instruction: MealInstruction;
  iot_slot_number: number; // 1-4
  consecutive_misses: number;
  max_consecutive_misses: number;
  remaining_pills: number;
  created_at: string;
  updated_at: string;
}

export interface DoseLog {
  id: string;
  patient_id: string;
  medication_id: string;
  caretaker_id?: string | null;
  scheduled_at: string;
  status: DoseStatus;
  verification_method?: VerificationMethod | null;
  photo_proof_url?: string | null;
  verified_at?: string | null;
  created_at: string;
  medication?: Medication;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_name: string;
  specialty: string;
  date_time: string;
  location: string;
  notes?: string | null;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  created_at: string;
}

export interface MedicalBill {
  id: string;
  patient_id: string;
  title: string;
  amount: number;
  category: 'medication' | 'consultation' | 'lab_test' | 'hospital' | 'other';
  receipt_url?: string | null;
  uploaded_by_role: CareRole;
  created_at: string;
}

export interface CentralAuditLog {
  id: string;
  patient_id: string;
  actor_name: string;
  actor_role: CareRole | 'IOT_DEVICE' | 'SYSTEM';
  action_type: string;
  description: string;
  previous_value?: Record<string, any> | null;
  new_value?: Record<string, any> | null;
  created_at: string;
}

export interface EmergencyAlert {
  id: string;
  patient_id: string;
  medication_id: string;
  consecutive_misses: number;
  alert_message: string;
  acknowledged_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
  medication_name?: string;
}
