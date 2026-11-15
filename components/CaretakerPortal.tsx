'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import ConnectElderModal from './ConnectElderModal';
import DocumentViewerModal from './DocumentViewerModal';
import { 
  Camera, 
  CheckCircle, 
  Lock, 
  Clock, 
  Check, 
  HeartHandshake
} from 'lucide-react';

export default function CaretakerPortal() {
  const { 
    patient, 
    medications, 
    doseLogs, 
    takeDose, 
    speak 
  } = useApp();

  const [selectedDoseId, setSelectedDoseId] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400');
  const [isUploading, setIsUploading] = useState(false);
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

  const handlePhotoVerification = async (doseId: string) => {
    setIsUploading(true);
    speak('Uploading photo proof to secure cloud storage...');
    setTimeout(async () => {
      await takeDose(doseId, 'PHOTO_2FA', photoUrl);
      setIsUploading(false);
      setSelectedDoseId(null);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Shift Status Banner */}
      <div className="bg-[#0F141C] text-white rounded-3xl p-6 shadow-sm border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
              Shift Active
            </span>
            <span className="text-xs text-slate-400">· Time-bound Shift Validated</span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            Caretaker Duty: Ramesh Kumar
          </h1>
          <p className="text-xs text-slate-400">
            Assisting {patient.name} · Shift valid until 18:00 IST today
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-sm"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Connect to Elder</span>
          </button>

          <div className="bg-[#141A23] border border-slate-800 rounded-2xl px-4 py-2 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Shift Expiration</span>
            <span className="font-mono font-bold text-white text-sm">In 07h 45m</span>
          </div>
        </div>
      </div>

      {/* Security Scope Notice */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Scoped Role Policy:</span> Caretakers are restricted strictly to today&apos;s medication intake tasks and live camera proof submission. Financial ledgers and prescription limits are securely locked.
        </div>
      </div>

      {/* Main Task List */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight mb-4">
          Today&apos;s Medication Tasks & 2FA Verification
        </h2>

        <div className="space-y-3">
          {medications.map(med => {
            const dose = doseLogs.find(d => d.medication_id === med.id);
            const isVerified = dose && (dose.status === 'SENSOR_VERIFIED' || dose.status === 'DUAL_VERIFIED');
            const isSelected = selectedDoseId === dose?.id;

            return (
              <div 
                key={med.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isVerified
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isVerified ? '✓' : '💊'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {med.name} {med.dosage}
                      </div>
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Scheduled: {med.schedule_time.slice(0, 5)} IST</span>
                        <span>· {med.meal_instruction.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        {dose?.status === 'DUAL_VERIFIED' ? '2FA Dual Verified' : 'Sensor Verified'}
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedDoseId(isSelected ? null : dose?.id || null)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                      >
                        <Camera className="w-4 h-4" />
                        {isSelected ? 'Cancel Camera' : 'Submit Photo Proof'}
                      </button>
                    )}
                  </div>
                </div>

                {/* 2FA Photo Submission Modal */}
                {isSelected && dose && (
                  <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 p-4 rounded-xl">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-32 h-24 rounded-xl overflow-hidden border border-slate-300 relative shadow-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={photoUrl} 
                          alt="Pill proof preview" 
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                          Live Snapshot
                        </span>
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-xs font-bold text-slate-800">
                          Confirm Pill Administration: {med.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          CareSync timestamps this photo and appends it to the tamper-evident Central Audit Ledger for family review.
                        </p>

                        <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                          <button
                            onClick={() => handlePhotoVerification(dose.id)}
                            disabled={isUploading}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            {isUploading ? 'Verifying Proof...' : 'Approve & Submit 2FA'}
                          </button>
                        </div>
                      </div>
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
