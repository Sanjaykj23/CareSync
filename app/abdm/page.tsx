'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import RoleSwitcher from '@/components/RoleSwitcher';
import Link from 'next/link';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle, 
  QrCode, 
  Lock, 
  ExternalLink, 
  ArrowLeft, 
  Building2, 
  Calendar, 
  ToggleLeft, 
  ToggleRight,
  Sparkles
} from 'lucide-react';

export default function AbdmPage() {
  const { patient, abhaRecords, toggleAbhaConsent } = useApp();

  return (
    <div className="min-h-screen bg-[#F3F5F9] pb-20">
      <RoleSwitcher onOpenIotModal={() => {}} />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/elder"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
            NHA ABDM Sandbox Gateway (M1 · M2 · M3)
          </span>
        </div>

        {/* Hero Explanation Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-4xl p-6 sm:p-8 shadow-float border border-blue-800/40 relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Ayushman Bharat Digital Mission (ABDM) Integration
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Where is ABDM in CareSync?
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              CareSync is built from the ground up to integrate with the <strong>National Health Authority (NHA) ABDM Sandbox</strong>. 
              Elderly patients retain 100% digital ownership of their longitudinal electronic health records (EHR) through their verified <strong>ABHA (Ayushman Bharat Health Account)</strong> ID.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-blue-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="font-bold text-blue-300 block mb-0.5">Milestone 1 (M1)</span>
              <span className="text-slate-300 text-[11px]">ABHA ID Creation, Verification & QR Code Generation</span>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="font-bold text-emerald-300 block mb-0.5">Milestone 2 (M2)</span>
              <span className="text-slate-300 text-[11px]">HIP Data Publishing: Telemetry, Prescriptions & Bills</span>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="font-bold text-amber-300 block mb-0.5">Milestone 3 (M3)</span>
              <span className="text-slate-300 text-[11px]">Consent-Driven HIU Record Discovery & Exchange</span>
            </div>
          </div>
        </div>

        {/* Digital ABHA Card Representation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Official Indian ABHA Card UI */}
          <div className="md:col-span-5 bg-gradient-to-br from-white to-slate-50 rounded-4xl p-6 shadow-soft border-2 border-blue-200 relative overflow-hidden flex flex-col justify-between">
            {/* Card Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                    🇮🇳
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                      National Health Authority
                    </div>
                    <div className="text-[9px] text-slate-500">Government of India</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  ABDM Verified
                </span>
              </div>

              {/* Photo & Details */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-24 rounded-2xl bg-amber-100 border border-amber-200 text-amber-900 font-bold text-3xl flex items-center justify-center shadow-inner shrink-0">
                  👴
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                    {patient.name}
                  </h3>
                  <div className="text-xs text-slate-600">
                    <span className="text-slate-400">Gender / Age:</span> Male / {patient.age} Yrs
                  </div>
                  <div className="text-xs text-slate-600 font-mono">
                    <span className="text-slate-400 font-sans">Mobile:</span> +91 {patient.phone}
                  </div>
                  <div className="text-xs text-blue-700 font-mono font-semibold">
                    {patient.abha_address || 'sundaram.iyer@sbx'}
                  </div>
                </div>
              </div>
            </div>

            {/* ABHA Number & Barcode */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                ABHA Number
              </span>
              <div className="font-mono text-xl font-black text-slate-900 tracking-widest mt-0.5">
                {patient.abha_id}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>256-Bit Encrypted</span>
                </div>
                <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                  <QrCode className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Consent Manager & Linked Health Records */}
          <div className="md:col-span-7 bg-white rounded-4xl p-6 sm:p-7 shadow-soft border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Consent-Driven Health Locker
                </h3>
                <p className="text-xs text-slate-500">
                  DPDP Act compliant: You can toggle which diagnostic records doctors can access.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {abhaRecords.map(rec => (
                <div 
                  key={rec.id}
                  className="p-4 rounded-3xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {rec.record_type}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {rec.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {rec.doctor_name} · {rec.facility}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleAbhaConsent(rec.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                        rec.consent_granted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{rec.consent_granted ? 'Consent Granted' : 'Revoked'}</span>
                    </button>

                    <a
                      href={rec.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 transition-all shadow-sm"
                      title="Inspect Document"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>ABDM Sandbox Architecture:</strong> In production, CareSync queries the NHA Gateway API (`/v0.5/consent-requests/init` and `/v0.5/health-information/hip/request`) using OAuth bearer tokens to seamlessly sync with Indian hospital systems.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
