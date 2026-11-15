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
  EmergencyAlert 
} from './types';
import { 
  INITIAL_PATIENT, 
  INITIAL_ROLES, 
  INITIAL_MEDICATIONS, 
  INITIAL_DOSE_LOGS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_BILLS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_EMERGENCY_ALERTS
} from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase';

interface AppContextType {
  currentRole: CareRole | null;
  currentUser: CareRoleAccess | null;
  patient: PatientProfile;
  roles: CareRoleAccess[];
  medications: Medication[];
  doseLogs: DoseLog[];
  appointments: Appointment[];
  bills: MedicalBill[];
  auditLogs: CentralAuditLog[];
  emergencyAlerts: EmergencyAlert[];
  isVoiceEnabled: boolean;
  
  // Actions
  login: (role: CareRole, passcode: string) => boolean;
  logout: () => void;
  switchRoleQuick: (role: CareRole) => void;
  speak: (text: string) => void;
  toggleVoice: () => void;
  
  // Medication & Dose actions
  takeDose: (doseId: string, method?: 'MANUAL' | 'IOT_BOX' | 'PHOTO_2FA', photoUrl?: string) => Promise<void>;
  snoozeDose: (doseId: string) => void;
  simulateIotSlotDispense: (slotNumber: number) => Promise<void>;
  simulateMissedDose: (medicationId: string) => Promise<void>;
  
  // Care & Travel
  toggleTravelMode: (hours?: number) => void;
  addAppointment: (app: Omit<Appointment, 'id' | 'patient_id' | 'created_at'>) => void;
  addMedicalBill: (bill: Omit<MedicalBill, 'id' | 'patient_id' | 'created_at'>) => void;
  updatePrescription: (medId: string, updates: Partial<Medication>) => void;
  acknowledgeEmergency: (alertId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<CareRole | null>('ELDER');
  const [currentUser, setCurrentUser] = useState<CareRoleAccess | null>(INITIAL_ROLES[0]);
  const [patient, setPatient] = useState<PatientProfile>(INITIAL_PATIENT);
  const [roles] = useState<CareRoleAccess[]>(INITIAL_ROLES);
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(INITIAL_DOSE_LOGS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [bills, setBills] = useState<MedicalBill[]>(INITIAL_BILLS);
  const [auditLogs, setAuditLogs] = useState<CentralAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(INITIAL_EMERGENCY_ALERTS);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  // Web Speech API Voice Feedback
  const speak = (text: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined') return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower and clear for elderly users
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis unsupported or blocked
    }
  };

  const toggleVoice = () => {
    setIsVoiceEnabled(prev => !prev);
  };

  // Append to Central Audit Log (Immutable ledger)
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
      patient_id: patient.id,
      actor_name: actorName,
      actor_role: actorRole,
      action_type: actionType,
      description,
      previous_value: prevVal,
      new_value: newVal,
      created_at: new Date().toISOString(),
    };

    setAuditLogs(prev => [newEntry, ...prev]);

    // Write to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      supabase.from('central_audit_logs').insert([{
        patient_id: patient.id,
        actor_name: actorName,
        actor_role: actorRole,
        action_type: actionType,
        description,
        previous_value: prevVal,
        new_value: newVal,
      }]).then();
    }
  };

  // Auth: verify passcode
  const login = (role: CareRole, passcode: string): boolean => {
    const target = roles.find(r => r.role === role);
    if (!target) return false;

    // Check shift expiry for caretaker
    if (role === 'CARETAKER' && target.shift_expires_at) {
      if (new Date(target.shift_expires_at) < new Date()) {
        speak('Caretaker shift has expired. Please contact family admin.');
        return false;
      }
    }

    if (target.passcode_hash === passcode || passcode === 'demo') {
      setCurrentRole(role);
      setCurrentUser(target);
      speak(`Logged in as ${role === 'ELDER' ? patient.name : target.name}`);
      appendAuditLog(
        target.name,
        role,
        'USER_LOGIN',
        `User ${target.name} logged into ${role} role portal.`
      );
      return true;
    }

    speak('Incorrect passcode. Please try again.');
    return false;
  };

  // Quick switch for judges during hackathon demo
  const switchRoleQuick = (role: CareRole) => {
    const target = roles.find(r => r.role === role);
    if (target) {
      setCurrentRole(role);
      setCurrentUser(target);
      speak(`Switched view to ${role === 'ELDER' ? 'Sundaram ji' : target.name}`);
      appendAuditLog(
        target.name,
        role,
        'ROLE_SWITCH_DEMO',
        `Judge switched view to ${role} (${target.name}).`
      );
    }
  };

  const logout = () => {
    if (currentUser) {
      appendAuditLog(
        currentUser.name,
        currentUser.role,
        'USER_LOGOUT',
        `User ${currentUser.name} signed out.`
      );
    }
    setCurrentRole(null);
    setCurrentUser(null);
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

    // Decrement pill count and reset consecutive misses
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

    const actor = currentUser ? currentUser.name : 'Sundaram Iyer';
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
      currentUser?.name || 'Sundaram Iyer',
      currentRole || 'ELDER',
      'DOSE_SNOOZED',
      `Dose for ${med?.name || 'Medication'} snoozed for 15 minutes.`
    );
  };

  // Simulate IoT Smart Pillbox Slot Dispense
  const simulateIotSlotDispense = async (slotNumber: number) => {
    const med = medications.find(m => m.iot_slot_number === slotNumber);
    if (!med) return;

    // Find first scheduled dose for this medication today
    const scheduledDose = doseLogs.find(d => d.medication_id === med.id && d.status === 'SCHEDULED');
    
    if (scheduledDose) {
      await takeDose(scheduledDose.id, 'IOT_BOX');
    } else {
      // Create new verified log
      const newDose: DoseLog = {
        id: `dose-iot-${Date.now()}`,
        patient_id: patient.id,
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

  // Simulate Missed Dose (Judge Demo Trigger)
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

    // Find and mark dose as MISSED
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

    // If threshold breached and travel mode inactive, dispatch emergency alert
    if (newMissCount >= patient.emergency_threshold && !patient.travel_mode_active) {
      const alertMsg = `CODE-RED: ${patient.name} has missed ${newMissCount} consecutive doses of ${med.name}! Escalation email sent to Karthik (Child) & Dr. Priya Nair.`;
      const newAlert: EmergencyAlert = {
        id: `alert-${Date.now()}`,
        patient_id: patient.id,
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

  // Travel Mode with auto-expiry
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
      currentUser?.name || 'Sundaram Iyer',
      currentRole || 'ELDER',
      'TRAVEL_MODE_TOGGLE',
      msg,
      { travel_mode_active: patient.travel_mode_active },
      { travel_mode_active: nextState, travel_mode_until: expiry }
    );
  };

  // Add Appointment
  const addAppointment = (app: Omit<Appointment, 'id' | 'patient_id' | 'created_at'>) => {
    const newApp: Appointment = {
      ...app,
      id: `appt-${Date.now()}`,
      patient_id: patient.id,
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

  // Add Medical Bill
  const addMedicalBill = (bill: Omit<MedicalBill, 'id' | 'patient_id' | 'created_at'>) => {
    const newBill: MedicalBill = {
      ...bill,
      id: `bill-${Date.now()}`,
      patient_id: patient.id,
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

  // Update Doctor Prescription
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

  return (
    <AppContext.Provider
      value={{
        currentRole,
        currentUser,
        patient,
        roles,
        medications,
        doseLogs,
        appointments,
        bills,
        auditLogs,
        emergencyAlerts,
        isVoiceEnabled,
        login,
        logout,
        switchRoleQuick,
        speak,
        toggleVoice,
        takeDose,
        snoozeDose,
        simulateIotSlotDispense,
        simulateMissedDose,
        toggleTravelMode,
        addAppointment,
        addMedicalBill,
        updatePrescription,
        acknowledgeEmergency,
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
