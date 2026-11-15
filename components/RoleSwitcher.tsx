'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import Link from 'next/link';
import { 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  AlertTriangle, 
  LogOut, 
  History, 
  User, 
  LogIn
} from 'lucide-react';

interface RoleSwitcherProps {
  onOpenIotModal?: () => void;
}

export default function RoleSwitcher({ onOpenIotModal }: RoleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    currentRole, 
    currentUser,
    logout, 
    isVoiceEnabled, 
    toggleVoice, 
    medications,
    simulateMissedDose 
  } = useApp();

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'ELDER':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">👴 Elder Portal</span>;
      case 'CHILD':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">👨‍👩‍👧 Family Admin</span>;
      case 'CARETAKER':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">🧑‍⚕️ Caretaker Duty</span>;
      case 'DOCTOR':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">🩺 Clinical Doctor</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Visitor</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Authenticated User Indicator */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-all">
              CS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base">CareSync</span>
                {getRoleBadge(currentRole)}
              </div>
            </div>
          </Link>
        </div>

        {/* Current User Name */}
        {currentUser && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 font-medium">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Active:</span>
            <span className="font-bold text-slate-900">{currentUser.name}</span>
          </div>
        )}

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2">
          {/* Link to ABDM Gateway */}
          <Link
            href="/abdm"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              pathname === '/abdm'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">ABDM</span> Health Locker
          </Link>

          {/* Link to Central Audit Ledger */}
          <Link
            href="/dashboard/audit"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              pathname === '/dashboard/audit'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Audit</span> Ledger
          </Link>

          {/* Test Missed Dose Trigger for Judges */}
          <button
            onClick={() => {
              if (medications.length > 0) {
                simulateMissedDose(medications[0].id);
              }
            }}
            title="Simulate missed dose to test code-red escalation"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden lg:inline">Simulate</span> Miss
          </button>

          {/* Voice Audio Feedback Toggle */}
          <button
            onClick={toggleVoice}
            title={isVoiceEnabled ? 'Voice feedback active' : 'Voice muted'}
            className={`p-2 rounded-xl border transition-all ${
              isVoiceEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Sign In / Sign Out */}
          {currentRole ? (
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-all border border-slate-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
