'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import RoleSwitcher from '@/components/RoleSwitcher';
import DocumentViewerModal from '@/components/DocumentViewerModal';
import Link from 'next/link';
import { 
  ShieldCheck, 
  FileText, 
  QrCode, 
  Lock, 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Check, 
  Activity, 
  Building2,
  HelpCircle,
  CheckCircle2,
  Info,
  Unlink,
  RefreshCw
} from 'lucide-react';

export default function AbdmPage() {
  const { patient, abhaRecords, toggleAbhaConsent, linkAbhaId, unlinkAbhaId, speak, currentRole } = useApp();

  const [inputAbhaId, setInputAbhaId] = useState('');
  const [abdmOtp, setAbdmOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // In-app Document Viewer
  const [viewingDoc, setViewingDoc] = useState<{
    isOpen: boolean;
    title: string;
    imageUrl?: string | null;
    extractedText?: string | null;
    doctorOrFacility?: string;
    date?: string;
  }>({
    isOpen: false,
    title: '',
  });

  const dashboardPath = currentRole ? `/dashboard/${currentRole.toLowerCase()}` : '/dashboard/elder';

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!inputAbhaId || inputAbhaId.trim().length < 6) {
      setErrorMsg('Please enter a valid 14-digit ABHA Number or ABHA Address.');
      return;
    }
    setIsOtpSent(true);
    setAbdmOtp('123456'); // Pre-fill demo OTP
    speak('NHA Sandbox Gateway: Aadhaar OTP dispatched to registered mobile. Demo OTP is 123456.');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (abdmOtp !== '123456' && abdmOtp.length < 6) {
      setErrorMsg('Invalid OTP. Please enter 123456.');
      return;
    }

    setIsVerifying(true);
    speak('Connecting with National Health Authority Sandbox Gateway...');
    setTimeout(async () => {
      await linkAbhaId(inputAbhaId);
      setIsVerifying(false);
      setIsOtpSent(false);
      setInputAbhaId('');
    }, 1200);
  };

  const handleUnlink = async () => {
    if (confirm('Are you sure you want to unlink your ABHA ID? This will pause synced hospital records.')) {
      await unlinkAbhaId();
    }
  };

  const isAbhaLinked = Boolean(patient.abha_id && patient.abha_id.trim().length > 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans selection:bg-blue-600 selection:text-white">
      <RoleSwitcher />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Navigation Breadcrumb (Takes user directly back to their dashboard, DOES NOT log out) */}
        <div className="flex items-center justify-between">
          <Link
            href={dashboardPath}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-sm transition-all active:scale-98"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-600" /> Back to Dashboard
          </Link>

          <span className="text-xs font-mono px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200">
            NHA ABDM Sandbox Gateway (dev.abdm.gov.in)
          </span>
        </div>

        {/* What is ABDM & Purpose Explanation Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Ayushman Bharat Digital Mission (ABDM) Integration
              </h1>
              <span className="text-xs font-bold text-slate-500">
                Official National Health Authority (NHA) Architecture · Optional Feature
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">What is this page?</strong> ABDM is India&apos;s digital healthcare backbone. It provides every Indian citizen with a unique 14-digit <strong>ABHA ID</strong> (Ayushman Bharat Health Account) to digitally connect health records between hospitals, labs, and clinics.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Is it mandatory?</strong> No! Linking your ABHA ID is <strong>completely optional</strong>. You can use CareSync for pill reminders, IoT smart box monitoring, and family care without an ABHA ID.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">What happens when you link it?</strong> CareSync synchronizes verified hospital diagnostic tests and prescriptions directly from verified hospitals (Apollo, AIIMS) with senior-controlled DPDP consent.
              </div>
            </div>
          </div>
        </div>

        {/* IF NOT LINKED: Show Clean Optional Setup Form */}
        {!isAbhaLinked ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 max-w-2xl mx-auto space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl shadow-sm">
              🇮🇳
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Link Your ABHA Health ID (Optional)
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Enter your 14-digit ABHA Number or ABHA Address to simulate linking with India&apos;s National Health Authority Sandbox.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4 max-w-md mx-auto text-left">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ABHA Number / Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 91-4567-8901-2345 or user@abdm"
                    value={inputAbhaId}
                    onChange={e => setInputAbhaId(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold outline-none focus:border-blue-600 font-mono"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Tip: Enter any 14-digit number like <code>91-4567-8901-2345</code> for hackathon sandbox simulation.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verify with NHA Sandbox Gateway</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-md mx-auto text-left">
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  Aadhaar OTP sent to registered mobile for ABHA <strong>{inputAbhaId}</strong>. Demo OTP is <strong>123456</strong>.
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Enter 6-Digit NHA Verification OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={abdmOtp}
                    onChange={e => setAbdmOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full py-3 text-center text-xl font-mono tracking-widest rounded-2xl border-2 border-blue-400 bg-slate-50 focus:bg-white font-bold outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
                >
                  <span>{isVerifying ? 'Verifying with NHA Gateway...' : 'Confirm & Sync Health Records'}</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* IF LINKED: Show Verified ABHA Card & Linked EHR Records */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Official Indian ABHA Card UI */}
            <div className="md:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🇮🇳</span>
                    <div>
                      <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                        National Health Authority
                      </div>
                      <div className="text-[9px] text-slate-400">Government of India · ABHA Card</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                    VERIFIED
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-20 rounded-2xl bg-amber-100 text-amber-900 font-bold text-2xl flex items-center justify-center shadow-inner shrink-0">
                    👴
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                      {patient.name}
                    </h3>
                    <div className="text-xs text-slate-600">
                      <span className="text-slate-400">Age:</span> {patient.age} Yrs
                    </div>
                    <div className="text-xs text-slate-600 font-mono">
                      <span className="text-slate-400 font-sans">Mobile:</span> +91 {patient.phone}
                    </div>
                    <div className="text-xs text-blue-700 font-mono font-bold">
                      {patient.abha_address || `${patient.name.toLowerCase().replace(/\s+/g, '')}@abdm`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  ABHA NUMBER
                </span>
                <div className="font-mono text-lg sm:text-xl font-black text-slate-900 tracking-wider mt-0.5">
                  {patient.abha_id}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>NHA 256-Bit Cryptographic Shield</span>
                  </div>
                  <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUnlink}
                  className="mt-4 w-full py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-1.5"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Unlink ABHA Account</span>
                </button>
              </div>
            </div>

            {/* Consent Manager & Live Linked Health Records */}
            <div className="md:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Consent-Driven EHR Health Locker
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live clinical documents synchronized with NHA Sandbox.
                  </p>
                </div>

                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  {abhaRecords.length} Verified Records
                </span>
              </div>

              <div className="space-y-3">
                {abhaRecords.map(rec => (
                  <div 
                    key={rec.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs">
                            {rec.record_type}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {rec.date}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {rec.doctor_name} · {rec.facility}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingDoc({
                          isOpen: true,
                          title: `${rec.record_type} — ${rec.facility}`,
                          doctorOrFacility: `${rec.doctor_name} (${rec.facility})`,
                          date: rec.date,
                          extractedText: rec.extracted_clinical_notes,
                          imageUrl: rec.document_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
                        })}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all"
                      >
                        View
                      </button>

                      <button
                        onClick={() => toggleAbhaConsent(rec.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          rec.consent_granted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {rec.consent_granted ? '✓ Shared' : 'Revoked'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* In-app Document Viewer */}
      <DocumentViewerModal
        isOpen={viewingDoc.isOpen}
        onClose={() => setViewingDoc({ isOpen: false, title: '' })}
        title={viewingDoc.title}
        imageUrl={viewingDoc.imageUrl}
        extractedText={viewingDoc.extractedText}
        doctorOrFacility={viewingDoc.doctorOrFacility}
        date={viewingDoc.date}
      />
    </div>
  );
}
