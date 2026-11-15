'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import RoleSwitcher from '@/components/RoleSwitcher';
import ElderPortal from '@/components/ElderPortal';
import ChildPortal from '@/components/ChildPortal';
import CaretakerPortal from '@/components/CaretakerPortal';
import DoctorPortal from '@/components/DoctorPortal';
import CentralAuditLedger from '@/components/CentralAuditLedger';
import Link from 'next/link';
import { UserCheck, History, LogIn, UserPlus, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { currentRole, currentUser } = useApp();
  const [activeView, setActiveView] = useState<'portal' | 'ledger'>('portal');

  return (
    <main className="min-h-screen bg-[#F3F5F9] flex flex-col font-sans">
      {/* 1. Global Role Switcher Header */}
      <RoleSwitcher />

      {/* 2. Top Sub-navigation: Active Role Portal vs Central Audit Ledger */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('portal')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeView === 'portal'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>
                {currentRole ? `${currentRole} View` : 'Healthcare Portal'}
              </span>
            </button>

            <button
              onClick={() => setActiveView('ledger')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeView === 'ledger'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <History className="w-3.5 h-3.5 text-blue-500" />
              <span>Central Audit Ledger</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span>Active Account:</span>
              <span className="font-bold text-slate-800">
                {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Unauthenticated'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="px-3 py-1 text-xs font-bold rounded-xl text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1"
              >
                <LogIn className="w-3 h-3 text-slate-500" /> Sign In
              </Link>
              <Link
                href="/register"
                className="px-3 py-1 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" /> Register
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Body */}
      <div className="flex-1 py-4">
        {activeView === 'ledger' ? (
          <CentralAuditLedger />
        ) : (
          <>
            {currentRole === 'ELDER' && <ElderPortal />}
            {currentRole === 'CHILD' && <ChildPortal />}
            {currentRole === 'CARETAKER' && <CaretakerPortal />}
            {currentRole === 'DOCTOR' && <DoctorPortal />}

            {!currentRole && (
              <div className="max-w-md mx-auto my-16 text-center px-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  Welcome to CareSync
                </h2>
                <p className="text-sm text-slate-500 mt-1 mb-6">
                  Please sign in with your verified phone number or create an account with OTP.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    href="/login"
                    className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-sm"
                  >
                    Register with OTP
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
