'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { CareRole } from '@/lib/types';
import { Volume2, VolumeX, ShieldCheck, Cpu, AlertTriangle, LogOut } from 'lucide-react';

interface RoleSwitcherProps {
  onOpenIotModal: () => void;
}

export default function RoleSwitcher({ onOpenIotModal }: RoleSwitcherProps) {
  const { 
    currentRole, 
    switchRoleQuick, 
    logout, 
    isVoiceEnabled, 
    toggleVoice, 
    medications,
    simulateMissedDose 
  } = useApp();

  const roles: { role: CareRole; label: string; name: string; pinHint: string; badge: string; color: string }[] = [
    {
      role: 'ELDER',
      label: 'Elder',
      name: 'Sundaram Iyer',
      pinHint: 'PIN: 1234',
      badge: '👴 Giant PIN / Voice',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      role: 'CHILD',
      label: 'Child (Admin)',
      name: 'Karthik Sundaram',
      pinHint: 'PIN: 654321',
      badge: '👨‍👩‍👧 ABHA / Bills / Admin',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      role: 'CARETAKER',
      label: 'Caretaker',
      name: 'Ramesh Kumar',
      pinHint: 'Shift PIN: 987654',
      badge: '🧑‍⚕️ 2FA Photo / Meds Only',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      role: 'DOCTOR',
      label: 'Doctor',
      name: 'Dr. Priya Nair',
      pinHint: 'Passcode: DOC-4481',
      badge: '🩺 Clinical Rx & Limits',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Judge Preset Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold text-xl tracking-tighter">
            CS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">CareSync</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wide">
                Noon UI
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> ABDM Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Hackathon Judge Demo Switcher · Multi-Role Passcode Gateways
            </p>
          </div>
        </div>

        {/* 4-Role Quick Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {roles.map((item) => {
            const isActive = currentRole === item.role;
            return (
              <button
                key={item.role}
                onClick={() => switchRoleQuick(item.role)}
                title={`Switch to ${item.name} (${item.pinHint})`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-105'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{item.badge}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${isActive ? 'bg-slate-800 text-slate-300' : 'text-slate-400'}`}>
                  {item.pinHint.replace('PIN: ', '').replace('Passcode: ', '')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Controls: Voice, IoT Box Simulator, Simulate Miss Trigger */}
        <div className="flex items-center gap-2">
          {/* IoT Pillbox Simulator Trigger */}
          <button
            onClick={onOpenIotModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/25 transition-all"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden md:inline">IoT Box</span> (4 Slots)
          </button>

          {/* Test Missed Dose Trigger for Judges */}
          <button
            onClick={() => {
              if (medications.length > 0) {
                simulateMissedDose(medications[0].id);
              }
            }}
            title="Simulate a missed dose to trigger code-red escalation"
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

          {/* Sign Out */}
          {currentRole && (
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 transition-all border border-slate-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
