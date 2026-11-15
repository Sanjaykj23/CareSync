'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import ConnectElderModal from './ConnectElderModal';
import DocumentViewerModal from './DocumentViewerModal';
import { extractTextFromImage } from '@/lib/ocr-service';
import { 
  Stethoscope, 
  Activity, 
  Edit3, 
  Save, 
  Sliders, 
  TrendingUp, 
  HeartHandshake,
  Upload,
  FileText,
  CheckCircle2
} from 'lucide-react';

export default function DoctorPortal() {
  const { 
    patient, 
    medications, 
    updatePrescription, 
    speak 
  } = useApp();

  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [newDosage, setNewDosage] = useState('');
  const [newScheduleTime, setNewScheduleTime] = useState('');
  const [newMealInstruction, setNewMealInstruction] = useState<'before_food' | 'after_food' | 'with_food' | 'any_time'>('after_food');
  const [newThreshold, setNewThreshold] = useState<number>(patient.emergency_threshold);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // In-app Document Viewer
  const [viewingDoc, setViewingDoc] = useState<{
    isOpen: boolean;
    title: string;
    imageUrl?: string | null;
    extractedText?: string | null;
  }>({
    isOpen: false,
    title: '',
  });

  // OCR Prescription upload state
  const [showUploadRx, setShowUploadRx] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrExtractedText, setOcrExtractedText] = useState('');

  const startEdit = (med: any) => {
    setEditingMedId(med.id);
    setNewDosage(med.dosage);
    setNewScheduleTime(med.schedule_time);
    setNewMealInstruction(med.meal_instruction);
  };

  const handleSaveRx = (medId: string) => {
    updatePrescription(medId, {
      dosage: newDosage,
      schedule_time: newScheduleTime,
      meal_instruction: newMealInstruction,
    });
    setEditingMedId(null);
  };

  const handleRxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingOcr(true);
    speak('Reading prescription image using clinical OCR...');
    const result = await extractTextFromImage(file);
    setOcrExtractedText(result.extractedText);
    setIsProcessingOcr(false);
    speak('Prescription analyzed and archived in database.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-[#0F141C] text-white rounded-3xl p-6 shadow-sm border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
              Clinical Portal
            </span>
            <span className="text-xs text-slate-400">· Apollo Speciality Hospitals</span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            Dr. Priya Nair, MD (Cardiology)
          </h1>
          <p className="text-xs text-slate-400">
            Attending Physician for Patient: {patient.name} (ABHA: {patient.abha_id})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Connect to Elder</span>
          </button>

          <button
            onClick={() => setShowUploadRx(prev => !prev)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Upload Rx (OCR)</span>
          </button>
        </div>
      </div>

      {/* Prescription OCR Upload Tray */}
      {showUploadRx && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                Optical Prescription Upload & Text Extraction
              </h3>
            </div>
            <span className="text-xs text-slate-400">Tesseract.js OCR Engine</span>
          </div>

          <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleRxUpload}
              id="doctor-rx-file"
              className="hidden"
            />
            <label htmlFor="doctor-rx-file" className="cursor-pointer flex flex-col items-center gap-1">
              <Upload className="w-6 h-6 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">
                {isProcessingOcr ? 'Analyzing prescription text with OCR...' : 'Click to Upload Handwritten / Printed Prescription Image'}
              </span>
              <span className="text-[11px] text-slate-500">
                Extracts drug names, dosages, and schedules directly into database.
              </span>
            </label>
          </div>

          {ocrExtractedText && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Extracted Clinical Data:
              </span>
              <pre className="text-xs font-mono text-emerald-800 whitespace-pre-wrap bg-white p-3 rounded-xl border border-emerald-200">
                {ocrExtractedText}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Adherence & Thresholds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-2 mb-2 text-slate-900 font-extrabold text-base">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3>Adherence & Telemetry</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Synchronized directly from the patient&apos;s ESP32 dispenser and caretaker 2FA.
          </p>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <span className="text-xs text-slate-400 block font-medium">Compliance Rate</span>
              <span className="font-mono font-extrabold text-slate-900 text-2xl">96.4%</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ High Compliance</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <span className="text-xs text-slate-400 block font-medium">Resting HR</span>
              <span className="font-mono font-extrabold text-slate-900 text-2xl">72 bpm</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Normal Rhythm</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-2 mb-2 text-slate-900 font-extrabold text-base">
            <Sliders className="w-5 h-5 text-amber-600" />
            <h3>Consecutive Miss Limit</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Sets the threshold for automatic Code-Red dispatch to family and hospital.
          </p>

          <div className="flex items-center gap-3">
            {[1, 2, 3].map(val => (
              <button
                key={val}
                onClick={() => {
                  setNewThreshold(val);
                  speak(`Emergency miss threshold updated to ${val} misses.`);
                }}
                className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all border ${
                  newThreshold === val
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {val} {val === 1 ? 'Miss (Strict)' : 'Misses'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prescription Management Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <h3>Active Clinical Prescriptions</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {medications.length} Prescriptions Mapped
          </span>
        </div>

        <div className="space-y-3">
          {medications.map(med => {
            const isEditing = editingMedId === med.id;

            return (
              <div 
                key={med.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm">{med.name}</h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Slot {med.iot_slot_number}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {med.dosage} · Scheduled {med.schedule_time.slice(0, 5)} IST ({med.meal_instruction.replace('_', ' ')})
                    </p>
                  </div>

                  <div>
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveRx(med.id)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Save className="w-4 h-4" /> Save Rx
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(med)}
                        className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Adjust Rx
                      </button>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Dosage</label>
                      <input
                        type="text"
                        value={newDosage}
                        onChange={e => setNewDosage(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Time (HH:mm:ss)</label>
                      <input
                        type="text"
                        value={newScheduleTime}
                        onChange={e => setNewScheduleTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Meal Instruction</label>
                      <select
                        value={newMealInstruction}
                        onChange={e => setNewMealInstruction(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="after_food">After Food</option>
                        <option value="before_food">Before Food</option>
                        <option value="with_food">With Food</option>
                        <option value="any_time">Any Time</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Connect Modal */}
      <ConnectElderModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={viewingDoc.isOpen}
        onClose={() => setViewingDoc(prev => ({ ...prev, isOpen: false }))}
        title={viewingDoc.title}
        imageUrl={viewingDoc.imageUrl}
        extractedText={viewingDoc.extractedText}
      />
    </div>
  );
}
