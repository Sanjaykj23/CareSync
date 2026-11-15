'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  ShieldCheck, 
  Luggage, 
  Calendar, 
  Receipt, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  ExternalLink,
  Clock,
  MapPin,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function ChildPortal() {
  const { 
    patient, 
    medications, 
    appointments, 
    bills, 
    emergencyAlerts, 
    toggleTravelMode, 
    addAppointment, 
    addMedicalBill,
    acknowledgeEmergency,
    speak 
  } = useApp();

  const [showAddAppt, setShowAddAppt] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);

  // New appointment form state
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // New bill form state
  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billCategory, setBillCategory] = useState<'medication' | 'consultation' | 'lab_test' | 'hospital' | 'other'>('medication');

  const totalBillsAmount = bills.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !dateTime) return;
    addAppointment({
      doctor_name: doctorName,
      specialty: specialty || 'General Checkup',
      date_time: new Date(dateTime).toISOString(),
      location: location || 'Apollo Clinic, Chennai',
      notes,
      status: 'CONFIRMED',
    });
    setDoctorName('');
    setSpecialty('');
    setDateTime('');
    setLocation('');
    setNotes('');
    setShowAddAppt(false);
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billTitle || !billAmount) return;
    addMedicalBill({
      title: billTitle,
      amount: parseFloat(billAmount),
      category: billCategory,
      uploaded_by_role: 'CHILD',
      receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
    });
    setBillTitle('');
    setBillAmount('');
    setShowAddBill(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Admin Portal
            </span>
            <span className="text-xs text-slate-400">· Full Access Mode</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Care Coordinator: Karthik Sundaram
          </h1>
          <p className="text-sm text-slate-500">
            Monitoring health routines for {patient.name} (Father, Age {patient.age})
          </p>
        </div>

        {/* Travel Mode Toggle Button */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800">Travel / Pocket Mode</div>
            <div className="text-[11px] text-slate-400">
              {patient.travel_mode_active 
                ? 'Active (Alerts paused)' 
                : 'Inactive (Normal alarms)'}
            </div>
          </div>
          <button
            onClick={() => toggleTravelMode(6)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-sm ${
              patient.travel_mode_active
                ? 'bg-amber-500 text-white shadow-amber-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Luggage className="w-4 h-4" />
            <span>{patient.travel_mode_active ? 'Travel Active (6h)' : 'Enable Travel Mode'}</span>
          </button>
        </div>
      </div>

      {/* 2. Active Emergency Alert Banner (If consecutive misses breached) */}
      {emergencyAlerts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-500/30 rounded-3xl p-5 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-red-950">
                  Code-Red Safety Escalation Active
                </h3>
                <p className="text-xs font-medium text-red-800 mt-0.5">
                  {emergencyAlerts[0].alert_message}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold text-red-700">
                  <span>Dispatched to: Karthik (Son), Dr. Priya Nair (Cardiologist)</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => acknowledgeEmergency(emergencyAlerts[0].id)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all shrink-0"
            >
              Acknowledge & Resolve
            </button>
          </div>
        </div>
      )}

      {/* 3. Grid: ABDM Sandbox Status & Vitals Threshold */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* ABDM Ayushman Bharat Health Account Card */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
              <ShieldCheck className="w-4 h-4" />
              <span>ABDM Health ID (Sandbox)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              VERIFIED
            </span>
          </div>
          <div className="font-mono text-lg font-bold text-slate-900 tracking-wider">
            {patient.abha_id}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Linked to National Health Authority (NHA) Sandbox for consent-based electronic health record (EHR) sync.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">DPDP Act Compliant</span>
            <span className="text-blue-600 font-semibold cursor-pointer hover:underline flex items-center gap-1">
              View Health Locker <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Safety Threshold Card */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">Escalation Trigger</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Threshold: {patient.emergency_threshold} Misses
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {patient.emergency_threshold} Consecutive Misses
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automatically sends high-priority SMS and email alerts to all members of the Care Circle if missed.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Current Misses: 0</span>
            <span className="text-emerald-600 font-bold">Status: Safe</span>
          </div>
        </div>

        {/* Monthly Healthcare Spend Card */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600">
              <TrendingUp className="w-4 h-4" />
              <span>Healthcare Spend (Nov)</span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {bills.length} receipts
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalBillsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pharmacy refills, cardiac consultations, and diagnostic blood panels.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Insurance Claimable: 80%</span>
            <button
              onClick={() => setShowAddBill(true)}
              className="text-purple-600 font-bold hover:underline"
            >
              + Upload Bill
            </button>
          </div>
        </div>
      </div>

      {/* 4. Appointments & Medical Bills Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-900 text-lg">Upcoming Appointments</h3>
            </div>
            <button
              onClick={() => setShowAddAppt(prev => !prev)}
              className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Schedule
            </button>
          </div>

          {/* New Appointment Form Modal/Drawer */}
          {showAddAppt && (
            <form onSubmit={handleCreateAppointment} className="mb-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
              <div className="text-xs font-bold text-blue-900">New Clinical Consultation</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Doctor Name (e.g. Dr. Priya Nair)"
                  value={doctorName}
                  onChange={e => setDoctorName(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Specialty (e.g. Cardiology)"
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={e => setDateTime(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Hospital Location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAppt(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-xl font-bold shadow-sm"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          )}

          {/* Appointments List */}
          <div className="space-y-3">
            {appointments.map(app => (
              <div key={app.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{app.doctor_name}</h4>
                    <span className="text-xs font-medium text-blue-600 block">{app.specialty}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {app.status}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(app.date_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{app.location}</span>
                  </div>
                </div>
                {app.notes && (
                  <p className="mt-2 text-xs text-slate-600 italic bg-white p-2 rounded-xl border border-slate-100">
                    &quot;{app.notes}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Medical Bills & Receipts */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-purple-600" />
              <h3 className="font-extrabold text-slate-900 text-lg">Medical Bills & Receipts</h3>
            </div>
            <button
              onClick={() => setShowAddBill(prev => !prev)}
              className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Bill
            </button>
          </div>

          {/* New Bill Form */}
          {showAddBill && (
            <form onSubmit={handleCreateBill} className="mb-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
              <div className="text-xs font-bold text-purple-900">Upload Healthcare Receipt</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Bill Title (e.g. Apollo Pharmacy)"
                  value={billTitle}
                  onChange={e => setBillTitle(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Amount in ₹"
                  value={billAmount}
                  onChange={e => setBillAmount(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={billCategory}
                  onChange={e => setBillCategory(e.target.value as any)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="medication">Medication Refill</option>
                  <option value="consultation">Doctor Consultation</option>
                  <option value="lab_test">Lab Diagnostics</option>
                  <option value="hospital">Hospital Stay</option>
                  <option value="other">Other Supplies</option>
                </select>
                <div className="text-xs text-slate-500 flex items-center px-2">
                  Receipt OCR: Auto-Tagged
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBill(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-purple-600 text-white rounded-xl font-bold shadow-sm"
                >
                  Save Receipt
                </button>
              </div>
            </form>
          )}

          {/* Bills List */}
          <div className="space-y-3">
            {bills.map(bill => (
              <div key={bill.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                    ₹
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{bill.title}</h4>
                    <span className="text-[11px] text-slate-400 capitalize block">
                      {bill.category.replace('_', ' ')} · Uploaded by {bill.uploaded_by_role}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 text-base">
                    ₹{Number(bill.amount).toFixed(2)}
                  </span>
                  <a
                    href={bill.receipt_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 block hover:underline"
                  >
                    View Receipt ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
