'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import RoleSwitcher from '@/components/RoleSwitcher';
import ElderPortal from '@/components/ElderPortal';
import ChildPortal from '@/components/ChildPortal';
import CaretakerPortal from '@/components/CaretakerPortal';
import DoctorPortal from '@/components/DoctorPortal';
import CentralAuditLedger from '@/components/CentralAuditLedger';
import IoTPillboxSimulator from '@/components/IoTPillboxSimulator';
import ElderPinPad from '@/components/ElderPinPad';
import { ShieldCheck, History, UserCheck, KeyRound, Lock } from 'lucide-react';
import { CareRole } from '@/lib/types';

export default function Home() {
  const { currentRole, currentUser, login } = useApp();
  const [activeView, setActiveView] = useState<'portal' | 'ledger'>('portal');
  const [isIotModalOpen, setIsIotModalOpen] = useState(false);

  // Login view states for non-elder roles if logged out
  const [selectedAuthRole, setSelectedAuthRole] = useState<CareRole>('ELDER');
  const [manualPasscode, setManualPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(selectedAuthRole, manualPasscode);
    if (success) {
      setManualPasscode('');
      setAuthError(null);
    } else {
      setAuthError('Invalid passcode. Check demo presets above.');
    }
  };

  return (
    <main className="min-h-screen bg-[#F3F5F9] flex flex-col font-sans">
      {/* 1. Global Role Switcher & Judge Quick Presets */}
      <RoleSwitcher onOpenIotModal={() => setIsIotModalOpen(true)} />

      {/* 2. Top Navigation Sub-bar: Portal View vs Central Audit Ledger */}
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
                {currentRole ? `${currentRole} Portal` : 'Role Authentication'}
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

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span>Current Actor:</span>
            <span className="font-bold text-slate-800">
              {currentUser ? currentUser.name : 'Unauthenticated'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 py-4">
        {activeView === 'ledger' ? (
          <CentralAuditLedger />
        ) : (
          <>
            {/* If Logged In, Render Respective Role Portal */}
            {currentRole === 'ELDER' && <ElderPortal />}
            {currentRole === 'CHILD' && <ChildPortal />}
            {currentRole === 'CARETAKER' && <CaretakerPortal />}
            {currentRole === 'DOCTOR' && <DoctorPortal />}

            {/* If Logged Out, Show Role-based Login Gateway */}
            {!currentRole && (
              <div className="max-w-md mx-auto my-12 px-4">
                {/* Role Switcher Tabs for Login */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {(['ELDER', 'CHILD', 'CARETAKER', 'DOCTOR'] as CareRole[]).map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        setSelectedAuthRole(r);
                        setAuthError(null);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        selectedAuthRole === r
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Elder Giant PIN Pad */}
                {selectedAuthRole === 'ELDER' ? (
                  <ElderPinPad />
                ) : (
                  <div className="bg-white rounded-4xl p-8 shadow-float border border-slate-100">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 mb-4 mx-auto">
                      <Lock className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 text-center">
                      {selectedAuthRole} Authentication
                    </h3>
                    <p className="text-xs text-slate-500 text-center mt-1 mb-6">
                      {selectedAuthRole === 'CHILD' && 'Enter 6-digit passcode (Default: 654321)'}
                      {selectedAuthRole === 'CARETAKER' && 'Enter time-bound 6-digit PIN (Default: 987654)'}
                      {selectedAuthRole === 'DOCTOR' && 'Enter clinical license key (Default: DOC-4481)'}
                    </p>

                    <form onSubmit={handleManualLogin} className="space-y-4">
                      <div>
                        <input
                          type="password"
                          value={manualPasscode}
                          onChange={e => setManualPasscode(e.target.value)}
                          placeholder="Enter passcode..."
                          className="w-full px-4 py-3 text-center text-lg tracking-widest font-mono rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-blue-600 transition-all"
                          required
                        />
                      </div>

                      {authError && (
                        <div className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-xl text-center">
                          {authError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all"
                      >
                        Sign In as {selectedAuthRole}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. IoT Hardware Simulator Modal */}
      <IoTPillboxSimulator
        isOpen={isIotModalOpen}
        onClose={() => setIsIotModalOpen(false)}
      />
    </main>
  );
}
