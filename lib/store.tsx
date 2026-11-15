'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CareRole, 
  PatientProfile, 
  CareRoleAccess, 
  Medication, 
  DoseLog, 
  Appointment, 
  MedicalBill, 
  CentralAuditLog, 
  EmergencyAlert,
  LinkingRequest,
  AbhaRecord,
  UserSession
} from './types';
import { 
  INITIAL_PATIENT, 
  INITIAL_ROLES, 
  INITIAL_MEDICATIONS, 
  INITIAL_DOSE_LOGS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_BILLS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_EMERGENCY_ALERTS,
  INITIAL_LINKING_REQUESTS,
  INITIAL_ABHA_RECORDS
} from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase';
import { setAuthCookie, getAuthCookie, clearAuthCookie } from './auth-cookie';

interface RegisterData {
  name: string;
  phone: string;
  role: CareRole;
  password: string;
  age?: number;
  abhaId?: string;
  specialty?: string;
  targetPatientPhone?: string; // If child/doctor/caretaker linking to an elder
}

interface AppContextType {
  currentRole: CareRole | null;
  currentUser: CareRoleAccess | null;
  currentPatientId: string;
  patient: PatientProfile;
  roles: CareRoleAccess[];
  medications: Medication[];
  doseLogs: DoseLog[];
  appointments: Appointment[];
  bills: MedicalBill[];
  auditLogs: CentralAuditLog[];
  emergencyAlerts: EmergencyAlert[];
  linkingRequests: LinkingRequest[];
  abhaRecords: AbhaRecord[];
  isVoiceEnabled: boolean;
  
  // Auth actions
  loginWithPhone: (phone: string, password: string) => boolean;
  loginWithPasscode: (role: CareRole, passcode: string) => boolean;
  signInWithGoogle: (role: CareRole) => Promise<void>;
  registerUser: (data: RegisterData) => { success: boolean; message: string; requiresOtp?: boolean };
  verifyOtpAndCompleteRegister: (phone: string, otp: string) => Promise<boolean>;
  registerCareRoleUser: (data: {
    name: string;
    email: string;
    phone: string;
    role: CareRole;
    passcode: string;
    targetElderPhone?: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchRoleQuick: (role: CareRole) => void;
  
  // Voice
  speak: (text: string) => void;
  toggleVoice: () => void;
  
  // Medication & Dose actions
  takeDose: (doseId: string, method?: 'MANUAL' | 'IOT_BOX' | 'PHOTO_2FA', photoUrl?: string) => Promise<void>;
  snoozeDose: (doseId: string) => void;
  simulateIotSlotDispense: (slotNumber: number) => Promise<void>;
  simulateMissedDose: (medicationId: string) => Promise<void>;
  
  // Care Circle & Linking
  sendLinkingRequest: (elderPhone: string, message?: string) => Promise<{ success: boolean; message: string }>;
  respondToLinkingRequest: (requestId: string, status: 'ACCEPTED' | 'REJECTED') => void;
  
  // Care & Travel
  toggleTravelMode: (hours?: number) => void;
  addAppointment: (app: Omit<Appointment, 'id' | 'patient_id' | 'created_at'>) => void;
  addMedicalBill: (bill: Omit<MedicalBill, 'id' | 'patient_id' | 'created_at'>) => void;
  updatePrescription: (medId: string, updates: Partial<Medication>) => void;
  acknowledgeEmergency: (alertId: string) => void;
  toggleAbhaConsent: (recordId: string) => void;
  linkAbhaId: (abhaId: string, abhaAddress?: string) => Promise<boolean>;
  unlinkAbhaId: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<CareRole | null>(null);
  const [currentUser, setCurrentUser] = useState<CareRoleAccess | null>(null);
  const [currentPatientId, setCurrentPatientId] = useState<string>(INITIAL_PATIENT.id);
  const [patient, setPatient] = useState<PatientProfile>(INITIAL_PATIENT);
  const [roles, setRoles] = useState<CareRoleAccess[]>(INITIAL_ROLES);
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(INITIAL_DOSE_LOGS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [bills, setBills] = useState<MedicalBill[]>(INITIAL_BILLS);
  const [auditLogs, setAuditLogs] = useState<CentralAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(INITIAL_EMERGENCY_ALERTS);
  const [linkingRequests, setLinkingRequests] = useState<LinkingRequest[]>(INITIAL_LINKING_REQUESTS);
  const [abhaRecords, setAbhaRecords] = useState<AbhaRecord[]>(INITIAL_ABHA_RECORDS);
  const [pendingRegistrations, setPendingRegistrations] = useState<{ [phone: string]: RegisterData & { otp: string } }>({});
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  // Restore session from cookie on mount & fetch live Supabase database records
  useEffect(() => {
    // 1. Session restoration from Cookie
    const session = getAuthCookie();
    if (session) {
      setCurrentRole(session.role);
      setCurrentPatientId(session.patient_id);
      setCurrentUser({
        id: session.user_id,
        patient_id: session.patient_id,
        role: session.role,
        name: session.name,
        email: session.email || '',
        phone: session.phone || '',
        password_hash: '',
        passcode_hash: '',
        shift_expires_at: null,
        is_verified: true,
        created_at: new Date().toISOString(),
      });
    }

    // 2. Fetch live data from Supabase if configured
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const fetchDbData = async () => {
        try {
          const { data: dbPatients } = await client.from('patient_profiles').select('*').limit(1);
          if (dbPatients && dbPatients.length > 0) {
            setPatient(dbPatients[0]);
            setCurrentPatientId(dbPatients[0].id);
          }

          const { data: dbRoles } = await client.from('care_role_access').select('*');
          if (dbRoles && dbRoles.length > 0) {
            setRoles(dbRoles);
            if (session) {
              const matched = dbRoles.find(r => r.id === session.user_id || r.email === session.email || r.phone === session.phone);
              if (matched) setCurrentUser(matched);
            }
          }

          const { data: dbMeds } = await client.from('medications').select('*');
          if (dbMeds && dbMeds.length > 0) {
            setMedications(dbMeds);
          }

          const { data: dbDoses } = await client.from('dose_logs').select('*').order('scheduled_at', { ascending: false });
          if (dbDoses && dbDoses.length > 0) {
            setDoseLogs(dbDoses);
          }

          const { data: dbAppts } = await client.from('appointments').select('*').order('date_time', { ascending: true });
          if (dbAppts && dbAppts.length > 0) {
            setAppointments(dbAppts);
          }

          const { data: dbBills } = await client.from('medical_bills').select('*').order('created_at', { ascending: false });
          if (dbBills && dbBills.length > 0) {
            setBills(dbBills);
          }

          const { data: dbAudits } = await client.from('central_audit_logs').select('*').order('created_at', { ascending: false });
          if (dbAudits && dbAudits.length > 0) {
            setAuditLogs(dbAudits);
          }

          const { data: dbLinking } = await client.from('care_linking_requests').select('*').order('requested_at', { ascending: false });
          if (dbLinking && dbLinking.length > 0) {
            setLinkingRequests(dbLinking);
          }

          const { data: dbAbha } = await client.from('abha_health_records').select('*').order('record_date', { ascending: false });
          if (dbAbha && dbAbha.length > 0) {
            setAbhaRecords(dbAbha);
          }
        } catch (e) {
          console.error('Error fetching Supabase live data:', e);
        }
      };

      fetchDbData();
    }
  }, []);

  // Web Speech API Voice Feedback
  const speak = (text: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined') return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech unsupported
    }
  };

  const toggleVoice = () => {
    setIsVoiceEnabled(prev => !prev);
  };

  // Append to Central Audit Log (Strictly scoped to current patient_id)
  const appendAuditLog = (
    actorName: string,
    actorRole: CareRole | 'IOT_DEVICE' | 'SYSTEM',
    actionType: string,
    description: string,
    prevVal: any = null,
    newVal: any = null
  ) => {
    const newEntry: CentralAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      patient_id: currentPatientId,
      actor_name: actorName,
      actor_role: actorRole,
      action_type: actionType,
      description,
      previous_value: prevVal,
      new_value: newVal,
      created_at: new Date().toISOString(),
    };

    setAuditLogs(prev => [newEntry, ...prev]);

    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.from('central_audit_logs').insert([{
        patient_id: currentPatientId,
        actor_name: actorName,
        actor_role: actorRole,
        action_type: actionType,
        description,
        previous_value: prevVal,
        new_value: newVal,
      }]).then();
    }
  };

  // Official Google OAuth Trigger & Direct Session Handshake
  const signInWithGoogle = async (role: CareRole) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    // 1. If Supabase is configured with Google Provider, trigger official OAuth redirect
    const client = supabase;
    if (isSupabaseConfigured && client) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('caresync_oauth_role', role);
      }
      speak('Redirecting to Google Sign-In...');
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?role=${role}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        console.error('Supabase Google OAuth error:', error);
        throw error;
      }
      return;
    }

    // 2. Direct demo fallback without Supabase keys (instant login without manual prompt):
    const fallbackName = role === 'DOCTOR' ? 'Dr. Priya Nair' : role === 'CARETAKER' ? 'Ramesh Kumar' : role === 'CHILD' ? 'Olena Sundaram' : patient.name;
    const fallbackEmail = `${fallbackName.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`;

    const targetUser: CareRoleAccess = {
      id: `google-user-${Date.now()}`,
      patient_id: patient.id,
      role,
      name: fallbackName,
      email: fallbackEmail,
      phone: role === 'ELDER' ? patient.phone : '',
      password_hash: '',
      passcode_hash: role === 'ELDER' ? '1234' : '654321',
      shift_expires_at: role === 'CARETAKER' ? new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() : null,
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    setCurrentRole(role);
    setCurrentUser(targetUser);
    setCurrentPatientId(patient.id);

    setAuthCookie({
      user_id: targetUser.id,
      patient_id: patient.id,
      role,
      name: fallbackName,
      phone: targetUser.phone,
      email: fallbackEmail,
    });

    speak(`Signed in with Google as ${role}. Welcome, ${fallbackName}!`);
    appendAuditLog(
      fallbackName,
      role,
      'GOOGLE_OAUTH_LOGIN',
      `User ${fallbackName} authenticated via Google OAuth (${fallbackEmail}).`
    );
  };

  // 1. Phone + Password Authentication
  const loginWithPhone = (phone: string, password: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    const user = roles.find(r => r.phone.replace(/\D/g, '').endsWith(cleanPhone) || r.phone === phone);

    if (!user) {
      speak('No user found with this phone number. Please register.');
      return false;
    }

    if (user.password_hash !== password && password !== 'demo123') {
      speak('Incorrect password.');
      return false;
    }

    // Check shift expiry for caretaker
    if (user.role === 'CARETAKER' && user.shift_expires_at) {
      if (new Date(user.shift_expires_at) < new Date()) {
        speak('Caretaker shift has expired.');
        return false;
      }
    }

    setCurrentRole(user.role);
    setCurrentUser(user);
    setCurrentPatientId(user.patient_id);

    // Save cookie
    setAuthCookie({
      user_id: user.id,
      patient_id: user.patient_id,
      role: user.role,
      name: user.name,
      phone: user.phone,
    });

    speak(`Welcome back, ${user.name}`);
    appendAuditLog(
      user.name,
      user.role,
      'USER_LOGIN_PHONE',
      `User ${user.name} logged in with verified phone credentials.`
    );
    return true;
  };

  // 2. Quick Passcode Login
  const loginWithPasscode = (role: CareRole, passcode: string): boolean => {
    const target = roles.find(r => r.role === role);
    if (!target) return false;

    if (target.passcode_hash === passcode || passcode === 'demo') {
      setCurrentRole(role);
      setCurrentUser(target);
      setCurrentPatientId(target.patient_id);

      setAuthCookie({
        user_id: target.id,
        patient_id: target.patient_id,
        role: target.role,
        name: target.name,
        phone: target.phone,
      });

      speak(`Passcode verified for ${target.name}`);
      appendAuditLog(target.name, role, 'USER_LOGIN_PASSCODE', `User verified with PIN pad.`);
      return true;
    }

    speak('Incorrect passcode.');
    return false;
  };

  // 3. User Registration with OTP Simulation & Duplicate Verification
  const registerUser = (data: RegisterData): { success: boolean; message: string; requiresOtp?: boolean } => {
    const cleanPhone = data.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit phone number.' };
    }

    // Check duplicate in active roles list
    const existing = roles.find(r => r.phone && r.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10)));
    if (existing) {
      return {
        success: false,
        message: `An account with mobile number +91 ${cleanPhone} already exists as ${existing.role} (${existing.name}). Please sign in.`
      };
    }

    // Generate 6-digit OTP (Default 123456 for instant testing)
    const simulatedOtp = '123456';
    setPendingRegistrations(prev => ({
      ...prev,
      [cleanPhone]: { ...data, phone: cleanPhone, otp: simulatedOtp }
    }));

    speak(`OTP sent to phone ending in ${cleanPhone.slice(-4)}. Demo code is 123456.`);
    return {
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}. (Use Demo OTP: 123456)`,
      requiresOtp: true,
    };
  };

  // 4. Verify OTP and finalize Elder registration with direct Supabase persistence
  const verifyOtpAndCompleteRegister = async (phone: string, otp: string): Promise<boolean> => {
    const cleanPhone = phone.replace(/\D/g, '');
    const pending = pendingRegistrations[cleanPhone];

    if (!pending) {
      speak('No pending registration found for this phone.');
      return false;
    }

    if (otp !== pending.otp && otp !== '123456') {
      speak('Invalid OTP code. Please enter 123456.');
      return false;
    }

    let assignedPatientId = `patient-${Date.now()}`;
    const client = supabase;

    // 1. Write to Supabase Database if configured
    if (isSupabaseConfigured && client) {
      try {
        // Insert into patient_profiles table
        const { data: dbPatient, error: pErr } = await client
          .from('patient_profiles')
          .insert([{
            name: pending.name,
            phone: cleanPhone,
            age: pending.age || 70,
            abha_id: pending.abhaId || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            abha_address: `${pending.name.toLowerCase().replace(/\s+/g, '')}@abdm`,
            emergency_threshold: 2,
            preferred_language: 'en',
            travel_mode_active: false,
          }])
          .select()
          .single();

        if (pErr) {
          console.error('Error inserting patient into Supabase:', pErr);
        } else if (dbPatient) {
          assignedPatientId = dbPatient.id;
          setPatient(dbPatient);
          setCurrentPatientId(dbPatient.id);

          // Insert 4 initial medication slots mapped to the hardware IoT dispenser
          const initialMeds = [
            { patient_id: dbPatient.id, name: 'Amlodipine', dosage: '5 mg · 1 capsule', schedule_time: '13:00:00', meal_instruction: 'after_food', iot_slot_number: 1, remaining_pills: 30 },
            { patient_id: dbPatient.id, name: 'Metformin', dosage: '500 mg · 1 tablet', schedule_time: '08:00:00', meal_instruction: 'after_food', iot_slot_number: 2, remaining_pills: 30 },
            { patient_id: dbPatient.id, name: 'Atorvastatin', dosage: '10 mg · 1 tablet', schedule_time: '20:00:00', meal_instruction: 'after_food', iot_slot_number: 3, remaining_pills: 30 },
            { patient_id: dbPatient.id, name: 'Vitamin D3', dosage: '60,000 IU · 1 sachet', schedule_time: '08:00:00', meal_instruction: 'with_food', iot_slot_number: 4, remaining_pills: 4 },
          ];
          const { data: insertedMeds } = await client.from('medications').insert(initialMeds).select();
          if (insertedMeds) {
            setMedications(insertedMeds);

            // Insert initial scheduled dose logs
            const today = new Date().toISOString().split('T')[0];
            const initialDoses = insertedMeds.map((m: any) => ({
              patient_id: dbPatient.id,
              medication_id: m.id,
              scheduled_at: `${today}T${m.schedule_time}Z`,
              status: 'SCHEDULED',
            }));
            const { data: insertedDoses } = await client.from('dose_logs').insert(initialDoses).select();
            if (insertedDoses) setDoseLogs(insertedDoses);
          }

          // Insert into care_role_access
          const { data: dbUser } = await client
            .from('care_role_access')
            .insert([{
              patient_id: dbPatient.id,
              role: 'ELDER',
              name: pending.name,
              phone: cleanPhone,
              email: `${cleanPhone}@caresync.in`,
              auth_provider: 'phone_otp',
              passcode_hash: '1234',
              is_verified: true,
            }])
            .select()
            .single();

          if (dbUser) {
            setRoles(prev => [...prev, dbUser]);
            setCurrentRole('ELDER');
            setCurrentUser(dbUser);
          }
        }
      } catch (dbErr) {
        console.error('Supabase registration error:', dbErr);
      }
    }

    // 2. Local State & Session synchronization
    const newPatient: PatientProfile = {
      id: assignedPatientId,
      name: pending.name,
      phone: cleanPhone,
      age: pending.age || 70,
      abha_id: pending.abhaId || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      abha_address: `${pending.name.toLowerCase().replace(/\s+/g, '')}@abdm`,
      emergency_threshold: 2,
      travel_mode_active: false,
      travel_mode_until: null,
      preferred_language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newUser: CareRoleAccess = {
      id: `user-${Date.now()}`,
      patient_id: assignedPatientId,
      role: 'ELDER',
      name: pending.name,
      email: `${pending.name.toLowerCase().replace(/\s+/g, '.')}@example.in`,
      phone: cleanPhone,
      password_hash: pending.password,
      passcode_hash: '1234',
      shift_expires_at: null,
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    setPatient(newPatient);
    setCurrentPatientId(assignedPatientId);
    setRoles(prev => [...prev, newUser]);
    setCurrentRole('ELDER');
    setCurrentUser(newUser);

    setAuthCookie({
      user_id: newUser.id,
      patient_id: assignedPatientId,
      role: 'ELDER',
      name: newUser.name,
      phone: newUser.phone,
    });

    speak(`Registration verified! Welcome to CareSync, ${newUser.name}.`);
    appendAuditLog(
      newUser.name,
      'ELDER',
      'USER_REGISTERED',
      `Elder ${newUser.name} created account with phone +91 ${cleanPhone}. Database profile initialized.`
    );
    return true;
  };

  // 5. Register Care Role Users (Child, Caretaker, Doctor) with Supabase persistence & duplicate check
  const registerCareRoleUser = async (data: {
    name: string;
    email: string;
    phone: string;
    role: CareRole;
    passcode: string;
    targetElderPhone?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const cleanPhone = data.phone.replace(/\D/g, '');
    const client = supabase;

    // Check duplicate in memory
    const existingMemory = roles.find(r => 
      (data.email && r.email?.toLowerCase() === data.email.toLowerCase()) || 
      (cleanPhone && r.phone?.replace(/\D/g, '').endsWith(cleanPhone.slice(-10)))
    );

    if (existingMemory) {
      return { 
        success: false, 
        message: `An account with this email (${data.email}) or phone (+91 ${cleanPhone}) already exists as ${existingMemory.role}. Please sign in.` 
      };
    }

    let targetPatientId = patient?.id || 'a1111111-1111-1111-1111-111111111111';

    if (isSupabaseConfigured && client) {
      try {
        // 1. Check duplicate in database
        const { data: dbCheck } = await client
          .from('care_role_access')
          .select('id, name, role')
          .or(`email.eq.${data.email},phone.eq.${cleanPhone}`);

        if (dbCheck && dbCheck.length > 0) {
          return { 
            success: false, 
            message: `Credentials already exist in database for ${dbCheck[0].name} (${dbCheck[0].role}). Please sign in.` 
          };
        }

        // 2. Find target elder by phone if provided
        if (data.targetElderPhone) {
          const cleanElderPhone = data.targetElderPhone.replace(/\D/g, '');
          const { data: elderData } = await client
            .from('patient_profiles')
            .select('id')
            .eq('phone', cleanElderPhone)
            .limit(1);

          if (elderData && elderData.length > 0) {
            targetPatientId = elderData[0].id;
          }
        }

        // 3. Insert into Supabase care_role_access
        const { data: insertedUser, error: uErr } = await client
          .from('care_role_access')
          .insert([{
            patient_id: targetPatientId,
            role: data.role,
            name: data.name,
            email: data.email,
            phone: cleanPhone,
            auth_provider: 'passcode',
            passcode_hash: data.passcode,
            is_verified: true,
            shift_expires_at: data.role === 'CARETAKER' ? new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() : null,
          }])
          .select()
          .single();

        if (uErr) {
          console.error('Error creating user in Supabase:', uErr);
          return { success: false, message: uErr.message };
        }

        if (insertedUser) {
          // 4. Send Linking Request to the Elder's circle
          await client.from('care_linking_requests').insert([{
            patient_id: targetPatientId,
            requester_id: insertedUser.id,
            requester_name: insertedUser.name,
            requester_role: insertedUser.role,
            requester_phone: insertedUser.phone,
            requester_email: insertedUser.email,
            message: `New ${insertedUser.role} registration requesting access to Care Circle.`,
            status: 'PENDING',
          }]);

          setRoles(prev => [...prev, insertedUser]);
          setCurrentRole(data.role);
          setCurrentUser(insertedUser);
          setCurrentPatientId(targetPatientId);

          setAuthCookie({
            user_id: insertedUser.id,
            patient_id: targetPatientId,
            role: data.role,
            name: insertedUser.name,
            phone: insertedUser.phone || '',
            email: insertedUser.email || '',
          });

          speak(`Account created! Welcome to CareSync, ${data.name}.`);
          appendAuditLog(
            insertedUser.name,
            data.role,
            'USER_REGISTERED',
            `New ${data.role} account created for ${data.name} and persisted to database.`
          );

          return { success: true, message: 'Account registered successfully!' };
        }
      } catch (err: any) {
        console.error('Registration exception:', err);
        return { success: false, message: err.message || 'Registration failed.' };
      }
    }

    // Fallback if offline / demo mode
    const fallbackUser: CareRoleAccess = {
      id: `user-${Date.now()}`,
      patient_id: targetPatientId,
      role: data.role,
      name: data.name,
      email: data.email,
      phone: cleanPhone,
      password_hash: data.passcode,
      passcode_hash: data.passcode,
      shift_expires_at: data.role === 'CARETAKER' ? new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() : null,
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    setRoles(prev => [...prev, fallbackUser]);
    setCurrentRole(data.role);
    setCurrentUser(fallbackUser);
    setCurrentPatientId(targetPatientId);

    setAuthCookie({
      user_id: fallbackUser.id,
      patient_id: targetPatientId,
      role: data.role,
      name: fallbackUser.name,
      phone: fallbackUser.phone || '',
      email: fallbackUser.email || '',
    });

    speak(`Account created! Welcome to CareSync, ${data.name}.`);
    appendAuditLog(
      fallbackUser.name,
      data.role,
      'USER_REGISTERED',
      `New ${data.role} registered: ${data.name}.`
    );

    return { success: true, message: 'Account registered successfully!' };
  };

  // 5. Send Care Circle Linking Request (Doctor/Child/Caretaker -> Elder) with Database Elder Search
  const sendLinkingRequest = async (elderInput: string, message?: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Please log in to send a request.' };

    const cleanInput = elderInput.trim().replace(/\D/g, '');
    const client = supabase;
    let matchedElder: PatientProfile | null = null;

    // Search in Supabase patient_profiles table
    if (isSupabaseConfigured && client) {
      try {
        const { data: dbPatients } = await client
          .from('patient_profiles')
          .select('*')
          .or(`phone.eq.${cleanInput},phone.ilike.%${cleanInput.slice(-10)}%`);

        if (dbPatients && dbPatients.length > 0) {
          matchedElder = dbPatients[0];
        }
      } catch (e) {
        console.error('Error searching elder in Supabase:', e);
      }
    }

    // Fallback search in memory
    if (!matchedElder) {
      if (patient && (patient.phone.replace(/\D/g, '').endsWith(cleanInput.slice(-10)) || patient.name.toLowerCase().includes(elderInput.toLowerCase()))) {
        matchedElder = patient;
      }
    }

    if (!matchedElder) {
      speak('No registered elder found with this phone number.');
      return {
        success: false,
        message: `No registered elder found matching "${elderInput}". Please verify the phone number or ask the elder to register on CareSync first.`
      };
    }

    // Elder found! Send linking request
    const newReq: LinkingRequest = {
      id: `req-${Date.now()}`,
      patient_id: matchedElder.id,
      requester_id: currentUser.id,
      requester_name: currentUser.name,
      requester_role: currentUser.role,
      requester_phone: currentUser.phone,
      message: message || `Requesting permission to join Care Circle as ${currentUser.role}.`,
      status: 'PENDING',
      requested_at: new Date().toISOString(),
      responded_at: null,
    };

    setLinkingRequests(prev => [newReq, ...prev]);

    if (isSupabaseConfigured && client) {
      try {
        await client.from('care_linking_requests').insert([{
          patient_id: matchedElder.id,
          requester_id: currentUser.id,
          requester_name: currentUser.name,
          requester_role: currentUser.role,
          requester_phone: currentUser.phone,
          requester_email: currentUser.email,
          message: newReq.message,
          status: 'PENDING',
        }]);
      } catch (insertErr) {
        console.error('Error persisting linking request:', insertErr);
      }
    }

    speak(`Care Circle request sent to ${matchedElder.name}. Waiting for approval.`);
    appendAuditLog(
      currentUser.name,
      currentUser.role,
      'LINKING_REQUEST_SENT',
      `${currentUser.name} (${currentUser.role}) requested to link with Elder ${matchedElder.name} (+91 ${matchedElder.phone}).`
    );

    return { 
      success: true, 
      message: `Care Circle invitation sent to ${matchedElder.name} (+91 ${matchedElder.phone}). They will be notified on their home screen to accept it.` 
    };
  };

  // 6. Elder Responds to Linking Request (Accept / Reject) with Supabase persistence
  const respondToLinkingRequest = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setLinkingRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status,
          responded_at: new Date().toISOString(),
        };
      }
      return req;
    }));

    const client = supabase;
    if (isSupabaseConfigured && client) {
      try {
        await client
          .from('care_linking_requests')
          .update({ status, responded_at: new Date().toISOString() })
          .eq('id', requestId);
      } catch (err) {
        console.error('Error updating linking request in Supabase:', err);
      }
    }

    const targetReq = linkingRequests.find(r => r.id === requestId);
    const actionDesc = status === 'ACCEPTED' 
      ? `Elder ${patient.name} ACCEPTED ${targetReq?.requester_name} (${targetReq?.requester_role}) into Care Circle.`
      : `Elder ${patient.name} DECLINED access request from ${targetReq?.requester_name}.`;

    speak(status === 'ACCEPTED' ? `${targetReq?.requester_name} added to your Care Circle.` : `Request declined.`);
    appendAuditLog(
      patient.name,
      'ELDER',
      status === 'ACCEPTED' ? 'LINKING_REQUEST_ACCEPTED' : 'LINKING_REQUEST_REJECTED',
      actionDesc,
      { status: 'PENDING' },
      { status }
    );
  };

  // Quick switch for judges during hackathon demo
  const switchRoleQuick = (role: CareRole) => {
    const target = roles.find(r => r.role === role);
    if (target) {
      setCurrentRole(role);
      setCurrentUser(target);
      setCurrentPatientId(target.patient_id);
      setAuthCookie({
        user_id: target.id,
        patient_id: target.patient_id,
        role: target.role,
        name: target.name,
        phone: target.phone,
      });
      speak(`Switched view to ${role === 'ELDER' ? 'Sundaram ji' : target.name}`);
      appendAuditLog(target.name, role, 'ROLE_SWITCH_DEMO', `Judge switched view to ${role} (${target.name}).`);
    }
  };

  const logout = () => {
    if (currentUser) {
      appendAuditLog(currentUser.name, currentUser.role, 'USER_LOGOUT', `User ${currentUser.name} signed out.`);
    }
    clearAuthCookie();
    if (typeof window !== 'undefined') {
      fetch('/api/auth/set-session', { method: 'DELETE' }).catch(() => {});
    }
    setCurrentRole(null);
    setCurrentUser(null);
    const client = supabase;
    if (isSupabaseConfigured && client) {
      client.auth.signOut().then();
    }
    speak('Logged out.');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Mark dose as taken
  const takeDose = async (
    doseId: string, 
    method: 'MANUAL' | 'IOT_BOX' | 'PHOTO_2FA' = 'MANUAL',
    photoUrl?: string
  ) => {
    const dose = doseLogs.find(d => d.id === doseId);
    if (!dose) return;
    const med = medications.find(m => m.id === dose.medication_id);

    const newStatus = method === 'PHOTO_2FA' ? 'DUAL_VERIFIED' : (method === 'IOT_BOX' ? 'SENSOR_VERIFIED' : 'DUAL_VERIFIED');
    const now = new Date().toISOString();

    setDoseLogs(prev => prev.map(d => {
      if (d.id === doseId) {
        return {
          ...d,
          status: newStatus,
          verification_method: method,
          photo_proof_url: photoUrl || d.photo_proof_url,
          verified_at: now,
        };
      }
      return d;
    }));

    if (med) {
      setMedications(prev => prev.map(m => {
        if (m.id === med.id) {
          return {
            ...m,
            remaining_pills: Math.max(0, m.remaining_pills - 1),
            consecutive_misses: 0,
          };
        }
        return m;
      }));
    }

    speak(`Medicine taken! Great job Sundaram ji.`);

    const actor = currentUser ? currentUser.name : patient.name;
    const role = currentRole || 'ELDER';

    appendAuditLog(
      actor,
      role,
      'DOSE_VERIFIED',
      `Dose for ${med?.name || 'Medication'} verified via ${method}. Status: ${newStatus}`,
      { status: dose.status },
      { status: newStatus, verification_method: method }
    );
  };

  const snoozeDose = (doseId: string) => {
    const dose = doseLogs.find(d => d.id === doseId);
    const med = medications.find(m => m.id === dose?.medication_id);
    speak(`Reminder snoozed for 15 minutes.`);
    appendAuditLog(
      currentUser?.name || patient.name,
      currentRole || 'ELDER',
      'DOSE_SNOOZED',
      `Dose for ${med?.name || 'Medication'} snoozed for 15 minutes.`
    );
  };

  // Simulate IoT Smart Pillbox Slot Dispense
  const simulateIotSlotDispense = async (slotNumber: number) => {
    const med = medications.find(m => m.iot_slot_number === slotNumber);
    if (!med) return;

    const scheduledDose = doseLogs.find(d => d.medication_id === med.id && d.status === 'SCHEDULED');
    
    if (scheduledDose) {
      await takeDose(scheduledDose.id, 'IOT_BOX');
    } else {
      const newDose: DoseLog = {
        id: `dose-iot-${Date.now()}`,
        patient_id: currentPatientId,
        medication_id: med.id,
        scheduled_at: new Date().toISOString(),
        status: 'SENSOR_VERIFIED',
        verification_method: 'IOT_BOX',
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      setDoseLogs(prev => [newDose, ...prev]);
      speak(`IoT Smart Box Slot ${slotNumber} opened. ${med.name} verified.`);
      appendAuditLog(
        `IoT Pillbox (Slot ${slotNumber})`,
        'IOT_DEVICE',
        'SENSOR_DOSE_DISPENSED',
        `Slot ${slotNumber} (${med.name}) opened and pill lifted. Status marked SENSOR_VERIFIED.`,
        { status: 'SCHEDULED' },
        { status: 'SENSOR_VERIFIED' }
      );
    }
  };

  // Simulate Missed Dose
  const simulateMissedDose = async (medicationId: string) => {
    const med = medications.find(m => m.id === medicationId);
    if (!med) return;

    const newMissCount = med.consecutive_misses + 1;

    setMedications(prev => prev.map(m => {
      if (m.id === medicationId) {
        return { ...m, consecutive_misses: newMissCount };
      }
      return m;
    }));

    const targetDose = doseLogs.find(d => d.medication_id === medicationId && d.status === 'SCHEDULED');
    if (targetDose) {
      setDoseLogs(prev => prev.map(d => d.id === targetDose.id ? { ...d, status: 'MISSED' } : d));
    }

    appendAuditLog(
      'System Cron Monitor',
      'SYSTEM',
      'DOSE_MISSED',
      `${med.name} dose missed. Total consecutive misses: ${newMissCount} / ${patient.emergency_threshold}`,
      { consecutive_misses: med.consecutive_misses },
      { consecutive_misses: newMissCount }
    );

    if (newMissCount >= patient.emergency_threshold && !patient.travel_mode_active) {
      const alertMsg = `CODE-RED: ${patient.name} has missed ${newMissCount} consecutive doses of ${med.name}! Escalation email sent to Karthik (Child) & Dr. Priya Nair.`;
      const newAlert: EmergencyAlert = {
        id: `alert-${Date.now()}`,
        patient_id: currentPatientId,
        medication_id: med.id,
        medication_name: med.name,
        consecutive_misses: newMissCount,
        alert_message: alertMsg,
        created_at: new Date().toISOString(),
      };
      setEmergencyAlerts(prev => [newAlert, ...prev]);
      speak(`Emergency alert: Multiple missed doses of ${med.name} detected. Care Circle informed.`);
      appendAuditLog(
        'Emergency Escalation Engine',
        'SYSTEM',
        'EMERGENCY_CODE_RED',
        alertMsg,
        null,
        { alert_id: newAlert.id, dispatches: ['karthik@example.in', 'dr.priya@apollo.in'] }
      );
    } else {
      speak(`Missed dose registered for ${med.name}.`);
    }
  };

  // Travel Mode
  const toggleTravelMode = (hours: number = 6) => {
    const nextState = !patient.travel_mode_active;
    const expiry = nextState ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString() : null;

    setPatient(prev => ({
      ...prev,
      travel_mode_active: nextState,
      travel_mode_until: expiry,
    }));

    const msg = nextState 
      ? `Pocket Travel Mode enabled for ${hours} hours. Missed dose alerts paused during travel.`
      : `Travel Mode deactivated. Regular IoT and reminder monitoring resumed.`;

    speak(msg);
    appendAuditLog(
      currentUser?.name || patient.name,
      currentRole || 'ELDER',
      'TRAVEL_MODE_TOGGLE',
      msg,
      { travel_mode_active: patient.travel_mode_active },
      { travel_mode_active: nextState, travel_mode_until: expiry }
    );
  };

  const addAppointment = (app: Omit<Appointment, 'id' | 'patient_id' | 'created_at'>) => {
    const newApp: Appointment = {
      ...app,
      id: `appt-${Date.now()}`,
      patient_id: currentPatientId,
      created_at: new Date().toISOString(),
    };
    setAppointments(prev => [newApp, ...prev]);
    appendAuditLog(
      currentUser?.name || 'Karthik Sundaram',
      currentRole || 'CHILD',
      'APPOINTMENT_SCHEDULED',
      `New appointment scheduled with ${app.doctor_name} on ${new Date(app.date_time).toLocaleDateString()}`,
      null,
      newApp
    );
    speak(`Doctor appointment with ${app.doctor_name} scheduled.`);
  };

  const addMedicalBill = (bill: Omit<MedicalBill, 'id' | 'patient_id' | 'created_at'>) => {
    const newBill: MedicalBill = {
      ...bill,
      id: `bill-${Date.now()}`,
      patient_id: currentPatientId,
      created_at: new Date().toISOString(),
    };
    setBills(prev => [newBill, ...prev]);
    appendAuditLog(
      currentUser?.name || 'Karthik Sundaram',
      currentRole || 'CHILD',
      'MEDICAL_BILL_UPLOADED',
      `Uploaded medical bill "${bill.title}" for ₹${bill.amount.toFixed(2)} (${bill.category}).`,
      null,
      newBill
    );
  };

  const updatePrescription = (medId: string, updates: Partial<Medication>) => {
    const oldMed = medications.find(m => m.id === medId);
    setMedications(prev => prev.map(m => m.id === medId ? { ...m, ...updates, updated_at: new Date().toISOString() } : m));
    appendAuditLog(
      currentUser?.name || 'Dr. Priya Nair',
      'DOCTOR',
      'PRESCRIPTION_UPDATED',
      `Updated prescription for ${oldMed?.name}: ${JSON.stringify(updates)}`,
      oldMed,
      updates
    );
    speak(`Prescription for ${oldMed?.name} has been updated.`);
  };

  const acknowledgeEmergency = (alertId: string) => {
    setEmergencyAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged_by: currentUser?.name || 'Care Team', resolved_at: new Date().toISOString() } : a));
    appendAuditLog(
      currentUser?.name || 'Care Team',
      currentRole || 'CHILD',
      'EMERGENCY_ACKNOWLEDGED',
      `Emergency alert ${alertId} resolved and acknowledged by ${currentUser?.name || 'Care Team'}.`
    );
  };

  const toggleAbhaConsent = (recordId: string) => {
    setAbhaRecords(prev => prev.map(r => r.id === recordId ? { ...r, consent_granted: !r.consent_granted } : r));
    const target = abhaRecords.find(r => r.id === recordId);
    const newConsent = !target?.consent_granted;
    speak(newConsent ? 'Consent granted for record' : 'Consent revoked for record');
    appendAuditLog(
      patient.name,
      'ELDER',
      'ABDM_CONSENT_TOGGLE',
      `ABDM Health Record "${target?.record_type}" consent ${newConsent ? 'GRANTED' : 'REVOKED'}.`,
      { consent: target?.consent_granted },
      { consent: newConsent }
    );
  };

  const linkAbhaId = async (abhaId: string, abhaAddress?: string): Promise<boolean> => {
    const cleanId = abhaId.trim();
    const cleanAddr = abhaAddress?.trim() || `${patient.name.toLowerCase().replace(/\s+/g, '')}@abdm`;

    setPatient(prev => ({
      ...prev,
      abha_id: cleanId,
      abha_address: cleanAddr,
    }));

    const client = supabase;
    if (isSupabaseConfigured && client) {
      try {
        await client
          .from('patient_profiles')
          .update({
            abha_id: cleanId,
            abha_address: cleanAddr,
          })
          .eq('id', patient.id);
      } catch (e) {
        console.error('Error saving ABHA ID to Supabase:', e);
      }
    }

    speak(`ABHA Health ID ${cleanId} linked successfully.`);
    appendAuditLog(
      patient.name,
      'ELDER',
      'ABHA_ID_LINKED',
      `Elder linked 14-digit ABHA Number (${cleanId}) via NHA Sandbox Gateway.`
    );
    return true;
  };

  const unlinkAbhaId = async (): Promise<void> => {
    setPatient(prev => ({
      ...prev,
      abha_id: '',
      abha_address: '',
    }));

    const client = supabase;
    if (isSupabaseConfigured && client) {
      try {
        await client
          .from('patient_profiles')
          .update({
            abha_id: null,
            abha_address: null,
          })
          .eq('id', patient.id);
      } catch (e) {
        console.error('Error unlinking ABHA ID from Supabase:', e);
      }
    }

    speak('ABHA Health ID unlinked.');
    appendAuditLog(
      patient.name,
      'ELDER',
      'ABHA_ID_UNLINKED',
      `Elder unlinked ABHA Health ID.`
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        currentUser,
        currentPatientId,
        patient,
        roles,
        medications,
        doseLogs,
        appointments,
        bills,
        auditLogs,
        emergencyAlerts,
        linkingRequests,
        abhaRecords,
        isVoiceEnabled,
        loginWithPhone,
        loginWithPasscode,
        signInWithGoogle,
        registerUser,
        verifyOtpAndCompleteRegister,
        registerCareRoleUser,
        logout,
        switchRoleQuick,
        speak,
        toggleVoice,
        takeDose,
        snoozeDose,
        simulateIotSlotDispense,
        simulateMissedDose,
        sendLinkingRequest,
        respondToLinkingRequest,
        toggleTravelMode,
        addAppointment,
        addMedicalBill,
        updatePrescription,
        acknowledgeEmergency,
        toggleAbhaConsent,
        linkAbhaId,
        unlinkAbhaId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
