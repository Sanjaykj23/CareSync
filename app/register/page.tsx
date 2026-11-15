'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import Link from 'next/link';
import { CareRole } from '@/lib/types';
import { 
  ArrowLeft, 
  ArrowRight, 
  Phone, 
  Users, 
  HeartHandshake, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<CareRole>('ELDER');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('74');
  const [targetElderPhone, setTargetElderPhone] = useState('9840123456');

  // OTP step
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Elder phone registration submit
  const handleElderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = registerUser({
      name,
      phone,
      role: 'ELDER',
      password: 'elder-secret',
      age: parseInt(age) || 74,
    });

    if (res.success) {
      setStep(2);
      setOtp('123456'); // Pre-fill demo OTP
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const success = verifyOtpAndCompleteRegister(phone, otp);
    if (success) {
      router.push('/dashboard/elder');
    } else {
      setErrorMsg('Invalid OTP code. Please enter 123456.');
    }
  };

  // Google OAuth registration (Calls official Supabase Google OAuth)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { registerUser, verifyOtpAndCompleteRegister, signInWithGoogle, speak } = useApp();

  const handleGoogleRegister = async (selectedRole: CareRole) => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    try {
      speak(`Redirecting to Google for official registration as ${selectedRole}...`);
      await signInWithGoogle(selectedRole);
      if (selectedRole === 'CHILD') router.push('/dashboard/child');
      else if (selectedRole === 'CARETAKER') router.push('/dashboard/caretaker');
      else if (selectedRole === 'DOCTOR') router.push('/dashboard/doctor');
      else router.push('/dashboard/elder');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google registration failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white font-sans">
      <div className="w-full max-w-lg">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to CareSync Home
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center mx-auto mb-2.5 shadow-sm">
            CS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Create CareSync Account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Senior Phone OTP & Google OAuth for Family & Clinicians
          </p>
        </div>

        {/* 4-Role Segmented Switcher */}
        <div className="bg-slate-200/80 p-1.5 rounded-2xl mb-5 grid grid-cols-4 gap-1">
          {[
            { id: 'ELDER', label: '👴 Elder' },
            { id: 'CHILD', label: '👨‍👩‍👧 Child' },
            { id: 'CARETAKER', label: '🧑‍⚕️ Caretaker' },
            { id: 'DOCTOR', label: '🩺 Doctor' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setRole(item.id as CareRole);
                setErrorMsg(null);
                setStep(1);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                role === item.id
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.06)] border border-slate-200/80">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-shake text-center">
              {errorMsg}
            </div>
          )}

          {/* ELDER REGISTRATION: Phone OTP */}
          {role === 'ELDER' ? (
            step === 1 ? (
              <form onSubmit={handleElderSubmit} className="space-y-4">
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-center">
                  <span className="text-xs font-bold text-blue-900 block">
                    Elder Registration
                  </span>
                  <span className="text-[11px] text-blue-700">
                    Creates an isolated healthcare profile with verified Mobile OTP.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Name
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
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
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-medium outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Send Verification OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium">OR</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  type="button"
                  onClick={() => handleGoogleRegister('ELDER')}
                  disabled={isGoogleLoading}
                  className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Quick Sign Up with Google</span>
                </button>
              </form>
            ) : (
              /* Step 2: OTP Verification */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Verify Your Mobile
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter the 6-digit OTP code sent to +91 {phone}
                  </p>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full py-3 text-center text-2xl font-mono tracking-widest rounded-2xl border-2 border-blue-400 bg-slate-50 focus:bg-white text-slate-900 font-bold outline-none"
                  required
                />

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm transition-all"
                >
                  Verify & Create Elder Profile
                </button>
              </form>
            )
          ) : (
            /* NON-ELDER REGISTRATION: Google OAuth + Elder Linking */
            <div className="space-y-5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <HeartHandshake className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Link with Your Elder&apos;s Care Circle
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Enter your parent&apos;s or patient&apos;s registered mobile number. CareSync will send an authorization request for their approval.
                </p>

                <div className="mt-3">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Elder&apos;s Registered Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={targetElderPhone}
                    onChange={e => setTargetElderPhone(e.target.value)}
                    placeholder="e.g. 9840123456"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Single Professional Google OAuth Register Button */}
              <button
                type="button"
                onClick={() => handleGoogleRegister(role)}
                disabled={isGoogleLoading}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-3 active:scale-98 disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isGoogleLoading ? 'Connecting to Official Google OAuth...' : `Continue with Google as ${role}`}</span>
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
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
