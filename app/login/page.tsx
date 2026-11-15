'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import Link from 'next/link';
import { ShieldCheck, Phone, Lock, Sparkles, ArrowRight, KeyRound } from 'lucide-react';
import { CareRole } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPhone, loginWithPasscode, speak } = useApp();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'phone' | 'pin'>('phone');
  const [selectedPinRole, setSelectedPinRole] = useState<CareRole>('ELDER');
  const [pinCode, setPinCode] = useState('');

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const success = loginWithPhone(phone, password);
    if (success) {
      navigateByRole(phone);
    } else {
      setErrorMsg('Invalid phone number or password. Check demo presets below.');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const success = loginWithPasscode(selectedPinRole, pinCode);
    if (success) {
      if (selectedPinRole === 'ELDER') router.push('/dashboard/elder');
      else if (selectedPinRole === 'CHILD') router.push('/dashboard/child');
      else if (selectedPinRole === 'CARETAKER') router.push('/dashboard/caretaker');
      else router.push('/dashboard/doctor');
    } else {
      setErrorMsg('Invalid passcode for this role.');
    }
  };

  const navigateByRole = (rawPhone: string) => {
    const clean = rawPhone.replace(/\D/g, '');
    if (clean.endsWith('23456')) router.push('/dashboard/elder');
    else if (clean.endsWith('98765')) router.push('/dashboard/child');
    else if (clean.endsWith('11223')) router.push('/dashboard/caretaker');
    else router.push('/dashboard/doctor');
  };

  // Quick fill demo credentials for hackathon judges
  const fillDemo = (role: CareRole, p: string, pass: string) => {
    setAuthMode('phone');
    setPhone(p);
    setPassword(pass);
    setErrorMsg(null);
    speak(`Demo credentials for ${role} loaded.`);
  };

  return (
    <div className="min-h-screen bg-[#F3F5F9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25 mb-3">
            CS
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Sign In to CareSync
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Passcode & Phone Authenticated Healthcare Gateway
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl mb-5">
          <button
            onClick={() => setAuthMode('phone')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              authMode === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Phone & Password
          </button>
          <button
            onClick={() => setAuthMode('pin')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              authMode === 'pin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Quick PIN / Passcode
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-4xl p-6 sm:p-8 shadow-float border border-slate-100">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-shake text-center">
              {errorMsg}
            </div>
          )}

          {authMode === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="e.g. 9840123456"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-medium outline-none focus:border-blue-600 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-medium outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['ELDER', 'CHILD', 'CARETAKER', 'DOCTOR'] as CareRole[]).map(r => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setSelectedPinRole(r)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedPinRole === r
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {selectedPinRole === 'ELDER' ? '4-Digit PIN' : 'Passcode / License Token'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder={selectedPinRole === 'ELDER' ? '1234' : 'Enter passcode...'}
                    value={pinCode}
                    onChange={e => setPinCode(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-medium outline-none focus:border-blue-600 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Verify Passcode</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-blue-600 font-bold hover:underline">
                Create Account with OTP
              </Link>
            </p>
          </div>
        </div>

        {/* Judge Demo Quick Auto-Fill Buttons */}
        <div className="mt-6 bg-white/80 rounded-3xl p-4 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Hackathon Judge Quick Test Logins:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fillDemo('ELDER', '9840123456', 'elder123')}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-all"
            >
              <div className="text-[11px] font-bold text-blue-900">👵 Sundaram (Elder)</div>
              <div className="text-[10px] text-blue-600 font-mono">9840123456 · elder123</div>
            </button>

            <button
              onClick={() => fillDemo('CHILD', '9884098765', 'child123')}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-all"
            >
              <div className="text-[11px] font-bold text-emerald-900">👨‍👩‍👧 Karthik (Child)</div>
              <div className="text-[10px] text-emerald-600 font-mono">9884098765 · child123</div>
            </button>

            <button
              onClick={() => fillDemo('CARETAKER', '9710011223', 'care123')}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition-all"
            >
              <div className="text-[11px] font-bold text-purple-900">🧑‍⚕️ Ramesh (Caretaker)</div>
              <div className="text-[10px] text-purple-600 font-mono">9710011223 · care123</div>
            </button>

            <button
              onClick={() => fillDemo('DOCTOR', '9444055667', 'doc123')}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-all"
            >
              <div className="text-[11px] font-bold text-amber-900">🩺 Dr. Priya (Doctor)</div>
              <div className="text-[10px] text-amber-600 font-mono">9444055667 · doc123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
