'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { CareRole } from '@/lib/types';
import Link from 'next/link';
import { 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Cpu, 
  AlertTriangle, 
  LogOut, 
  History, 
  FileText,
  UserPlus
} from 'lucide-react';

interface RoleSwitcherProps {
  onOpenIotModal?: () => void;
}

export default function RoleSwitcher({ onOpenIotModal }: RoleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    currentRole, 
    switchRoleQuick, 
    logout, 
    isVoiceEnabled, 
    toggleVoice, 
    medications,
    simulateMissedDose 
  } = useApp();

  const roles: { role: CareRole; label: string; name: string; pinHint: string; path: string; badge: string }[] = [
    {
      role: 'ELDER',
      label: 'Elder',
      name: 'Sundaram Iyer',
      pinHint: 'PIN: 1234',
      path: '/dashboard/elder',
      badge: '👴 Elder Portal',
    },
    {
      role: 'CHILD',
      label: 'Child (Admin)',
      name: 'Karthik Sundaram',
      pinHint: 'PIN: 654321',
      path: '/dashboard/child',
      badge: '👨‍👩‍👧 Family Admin',
    },
    {
      role: 'CARETAKER',
      label: 'Caretaker',
      name: 'Ramesh Kumar',
      pinHint: 'Shift: 987654',
      path: '/dashboard/caretaker',
      badge: '🧑‍⚕️ 2FA Photo Duty',
    },
    {
      role: 'DOCTOR',
      label: 'Doctor',
      name: 'Dr. Priya Nair',
      pinHint: 'Rx: DOC-4481',
      path: '/dashboard/doctor',
      badge: '🩺 Clinical Rx',
    },
  ];

  const handleRoleClick = (item: typeof roles[0]) => {
    switchRoleQuick(item.role);
    router.push(item.path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Judge Preset Indicator */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold text-xl tracking-tighter group-hover:scale-105 transition-all">
              CS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">CareSync</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wide">
                  Noon UI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                ABDM Sandbox · Multi-Tenant Family Circles
              </p>
            </div>
          </Link>
        </div>

        {/* 4-Role Quick Switcher Pills with Proper Routing */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {roles.map((item) => {
            const isActive = currentRole === item.role || pathname === item.path;
            return (
              <button
                key={item.role}
                onClick={() => handleRoleClick(item)}
                title={`Switch to ${item.name} (${item.pinHint})`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-105'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{item.badge}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${isActive ? 'bg-slate-800 text-slate-300' : 'text-slate-400'}`}>
                  {item.pinHint.replace('PIN: ', '').replace('Shift: ', '').replace('Rx: ', '')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2">
          {/* Link to ABDM Gateway */}
          <Link
            href="/abdm"
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
              pathname === '/abdm'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ABDM</span> Health Locker
          </Link>

          {/* Link to Central Audit Ledger */}
          <Link
            href="/dashboard/audit"
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
              pathname === '/dashboard/audit'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5 text-blue-600" />
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
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden lg:inline">Simulate</span> Miss
          </button>

          {/* Voice Audio Feedback Toggle */}
          <button
            onClick={toggleVoice}
            title={isVoiceEnabled ? 'Voice feedback active (Web Speech)' : 'Voice muted'}
            className={`p-2 rounded-full border transition-all ${
              isVoiceEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Login / Register / Logout */}
          {currentRole ? (
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              title="Sign Out"
              className="p-2 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 transition-all border border-slate-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
