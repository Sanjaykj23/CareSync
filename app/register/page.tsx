'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import Link from 'next/link';
import { CareRole } from '@/lib/types';
import { 
  UserCheck, 
  Phone, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  KeyRound, 
  Sparkles,
  HeartHandshake
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, verifyOtpAndCompleteRegister, speak } = useApp();

  // Registration step: 1 = Details, 2 = OTP Verification
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<CareRole>('ELDER');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('74');
  const [abhaId, setAbhaId] = useState('');
  const [targetElderPhone, setTargetElderPhone] = useState('9840123456');

  // OTP state
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = registerUser({
      name,
      phone,
      role,
      password,
      age: role === 'ELDER' ? parseInt(age) || 70 : undefined,
      abhaId: role === 'ELDER' ? abhaId : undefined,
      targetPatientPhone: role !== 'ELDER' ? targetElderPhone : undefined,
    });

    if (res.success) {
      setStatusMsg(res.message);
      setStep(2);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const success = verifyOtpAndCompleteRegister(phone, otp);
    if (success) {
      if (role === 'ELDER') router.push('/dashboard/elder');
      else if (role === 'CHILD') router.push('/dashboard/child');
      else if (role === 'CARETAKER') router.push('/dashboard/caretaker');
      else router.push('/dashboard/doctor');
    } else {
      setErrorMsg('Invalid OTP code. Please enter 123456.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 mb-3">
            CS
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Create CareSync Account
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Verified Healthcare Registration with ABDM & Care Circle Linking
          </p>
        </div>

        {/* Progress tracker */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {step === 1 ? '1' : '✓'}
            </span>
            <span className="text-xs font-bold text-slate-700">Account Details</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </span>
            <span className="text-xs font-bold text-slate-700">OTP Verification</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-4xl p-6 sm:p-8 shadow-float border border-slate-100">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-shake text-center">
              {errorMsg}
            </div>
          )}

          {statusMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
              {statusMsg}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Choose Your Healthcare Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ELDER', label: '👴 Elder', desc: 'Parent / Senior' },
                    { id: 'CHILD', label: '👨‍👩‍👧 Child', desc: 'Family Admin' },
                    { id: 'CARETAKER', label: '🧑‍⚕️ Caretaker', desc: 'Medication Duty' },
                    { id: 'DOCTOR', label: '🩺 Doctor', desc: 'Clinical Rx' },
                  ].map(item => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setRole(item.id as CareRole)}
                      className={`p-2.5 rounded-2xl text-left border transition-all ${
                        role === item.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-xs">{item.label}</div>
                      <div className={`text-[10px] ${role === item.id ? 'text-slate-300' : 'text-slate-400'}`}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sundaram Iyer"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-medium outline-none focus:border-blue-600 transition-all"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Mobile Number (For OTP Verification)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-medium outline-none focus:border-blue-600 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-medium outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Elder Specific Fields: Age & ABHA */}
              {role === 'ELDER' ? (
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-medium outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      ABHA ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 91-4567-8901-2345"
                      value={abhaId}
                      onChange={e => setAbhaId(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-medium outline-none font-mono text-xs"
                    />
                  </div>
                </div>
              ) : (
                /* Non-Elder Specific: Elder Phone for Linking */
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
                    <HeartHandshake className="w-4 h-4 text-blue-600" />
                    <span>Elder&apos;s Mobile (For Care Circle Linking)</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter Elder's 10-digit mobile number"
                    value={targetElderPhone}
                    onChange={e => setTargetElderPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-blue-200 bg-white font-mono mt-1"
                  />
                  <p className="text-[10px] text-blue-600 mt-1">
                    CareSync will send a connection request to this elder. Once accepted, you gain authorized access.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Continue to OTP Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Step 2: OTP Verification */
            <form onSubmit={handleOtpVerify} className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Verify Mobile OTP
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  We sent a 6-digit one-time password to <span className="font-mono font-bold">+91 {phone}</span>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                  autoFocus
                  className="w-full py-4 text-center text-3xl font-mono tracking-widest rounded-2xl border-2 border-blue-300 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all font-bold"
                />
              </div>

              {/* 1-Click Demo OTP Filler */}
              <button
                type="button"
                onClick={() => {
                  setOtp('123456');
                  speak('Demo OTP 123456 entered.');
                }}
                className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Hackathon Judge: Auto-Fill Demo OTP (123456)
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3.5 px-5 rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all active:scale-98"
                >
                  Verify & Enter Platform
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
