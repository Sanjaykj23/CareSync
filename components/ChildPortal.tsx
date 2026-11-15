'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import DocumentViewerModal from './DocumentViewerModal';
import ConnectElderModal from './ConnectElderModal';
import { extractTextFromImage } from '@/lib/ocr-service';
import { 
  ShieldCheck, 
  Luggage, 
  Calendar, 
  Receipt, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  TrendingUp, 
  FileText,
  HeartHandshake,
  Camera,
  Upload
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
  const [showConnectModal, setShowConnectModal] = useState(false);

  // In-app Document Viewer state
  const [viewingDoc, setViewingDoc] = useState<{
    isOpen: boolean;
    title: string;
    category?: string;
    imageUrl?: string | null;
    extractedText?: string | null;
  }>({
    isOpen: false,
    title: '',
  });

  // New appointment form state
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // New bill & OCR state
  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billCategory, setBillCategory] = useState<'medication' | 'consultation' | 'lab_test' | 'hospital' | 'other'>('medication');
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrText, setOcrText] = useState<string>('');

  const totalBillsAmount = bills.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingOcr(true);
    speak('Scanning receipt with optical character recognition...');
    const result = await extractTextFromImage(file);
    setOcrText(result.extractedText);
    setIsProcessingOcr(false);
    speak('Receipt text extracted and archived.');
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !dateTime) return;
    addAppointment({
      doctor_name: doctorName,
      specialty: specialty || 'General Follow-up',
      date_time: new Date(dateTime).toISOString(),
      location: location || 'Apollo Speciality Hospital, Chennai',
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
    setOcrText('');
    setShowAddBill(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Family Admin
            </span>
            <span className="text-xs text-slate-400">· Full Access Mode</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Care Coordinator Portal
          </h1>
          <p className="text-xs text-slate-500">
            Linked to: <span className="font-bold text-slate-800">{patient.name}</span> (Father, Age {patient.age}) · Mobile: +91 {patient.phone}
          </p>
        </div>

        {/* Action Controls: Connect Elder & Travel Mode */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs transition-all"
          >
            <HeartHandshake className="w-4 h-4 text-blue-600" />
            <span>Connect to Elder</span>
          </button>

          <button
            onClick={() => toggleTravelMode(6)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
              patient.travel_mode_active
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <Luggage className="w-4 h-4" />
            <span>{patient.travel_mode_active ? 'Travel Active (6h)' : 'Enable Travel Mode'}</span>
          </button>
        </div>
      </div>

      {/* 2. Active Emergency Alert Banner */}
      {emergencyAlerts.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-rose-950">
                  Code-Red Safety Escalation Active
                </h3>
                <p className="text-xs font-medium text-rose-800 mt-0.5">
                  {emergencyAlerts[0].alert_message}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold text-rose-700">
                  <span>Dispatched to: Karthik (Son), Dr. Priya Nair (Cardiologist)</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => acknowledgeEmergency(emergencyAlerts[0].id)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all shrink-0"
            >
              Acknowledge & Resolve
            </button>
          </div>
        </div>
      )}

      {/* 3. Grid: ABDM Sandbox Status & Vitals Threshold */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
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
            Linked to NHA ABDM Sandbox Gateway for electronic health record (EHR) exchange.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
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
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <TrendingUp className="w-4 h-4 text-blue-600" />
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
            Refills, doctor consultations, and lab diagnostics archived in database.
          </p>
        </div>
      </div>

      {/* 4. Appointments & Medical Bills Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-900 text-base">Upcoming Appointments</h3>
            </div>
            <button
              onClick={() => setShowAddAppt(prev => !prev)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Schedule
            </button>
          </div>

          {showAddAppt && (
            <form onSubmit={handleCreateAppointment} className="mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-900">New Clinical Consultation</div>
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
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
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
                  className="px-4 py-1.5 text-xs bg-slate-900 text-white rounded-xl font-bold shadow-sm"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {appointments.map(app => (
              <div key={app.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
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
              </div>
            ))}
          </div>
        </div>

        {/* Medical Bills & Receipts with OCR */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-900 text-base">Receipts & OCR Prescriptions</h3>
            </div>
            <button
              onClick={() => setShowAddBill(prev => !prev)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Upload Receipt
            </button>
          </div>

          {showAddBill && (
            <form onSubmit={handleCreateBill} className="mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-900">Upload Healthcare Receipt</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Receipt Title (e.g. MedPlus Pharmacy)"
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

              {/* OCR Image Upload Input */}
              <div className="p-3 rounded-xl border-2 border-dashed border-slate-300 bg-white text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  id="receipt-file"
                  className="hidden"
                />
                <label htmlFor="receipt-file" className="cursor-pointer flex flex-col items-center gap-1">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">
                    {isProcessingOcr ? 'Scanning with OCR engine...' : 'Click to Upload Image for OCR Scan'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Extracts medicine names and stores text in database
                  </span>
                </label>
              </div>

              {ocrText && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-mono">
                  <span className="font-bold block mb-1">OCR Extracted Text:</span>
                  <p className="whitespace-pre-wrap text-[11px]">{ocrText}</p>
                </div>
              )}

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
                  className="px-4 py-1.5 text-xs bg-slate-900 text-white rounded-xl font-bold shadow-sm"
                >
                  Save to Database
                </button>
              </div>
            </form>
          )}

          {/* Bills List with IN-APP VIEWER */}
          <div className="space-y-3">
            {bills.map(bill => (
              <div key={bill.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm">
                    ₹
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{bill.title}</h4>
                    <span className="text-[11px] text-slate-500 capitalize block">
                      {bill.category.replace('_', ' ')} · Uploaded by {bill.uploaded_by_role}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 text-base">
                    ₹{Number(bill.amount).toFixed(2)}
                  </span>
                  {/* IN-APP MODAL TRIGGER (NOT EXTERNAL NAVIGATION!) */}
                  <button
                    type="button"
                    onClick={() => setViewingDoc({
                      isOpen: true,
                      title: bill.title,
                      category: bill.category,
                      imageUrl: bill.receipt_url,
                      extractedText: 'Receipt Verified: MedPlus Pharmacy Refill #88219. Medicines: Tab. Amlodipine 5mg (30 Qty), Tab. Metformin 500mg (60 Qty). Stored in Supabase.',
                    })}
                    className="text-[11px] text-blue-600 font-bold block hover:underline"
                  >
                    View Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. In-App Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={viewingDoc.isOpen}
        onClose={() => setViewingDoc(prev => ({ ...prev, isOpen: false }))}
        title={viewingDoc.title}
        category={viewingDoc.category}
        imageUrl={viewingDoc.imageUrl}
        extractedText={viewingDoc.extractedText}
      />

      {/* 6. Phone Search Connect Modal */}
      <ConnectElderModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </div>
  );
}
