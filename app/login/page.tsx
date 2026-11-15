'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import Link from 'next/link';
import { CareRole } from '@/lib/types';
import { 
  Phone, 
  ArrowRight, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  Lock,
  ArrowLeft
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUnauthorized = searchParams.get('unauthorized') === 'true';
  const redirectTarget = searchParams.get('redirect') || '';
  const { loginWithPhone, loginWithPasscode, signInWithGoogle, speak } = useApp();

  // Target role selection
  const [selectedRole, setSelectedRole] = useState<CareRole>('ELDER');

  // Elder Auth state (OTP Phone or Google)
  const [elderPhone, setElderPhone] = useState('9840123456');
  const [elderOtp, setElderOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Google Name Customizer Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Handle Google OAuth
  const handleGoogleSignInTrigger = (role: CareRole) => {
    setSelectedRole(role);
    setShowGoogleModal(true);
  };

  const handleConfirmGoogleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    await signInWithGoogle(selectedRole, googleNameInput || undefined, googleEmailInput || undefined);
    setIsAuthenticating(false);
    setShowGoogleModal(false);

    if (selectedRole === 'ELDER') router.push('/dashboard/elder');
    else if (selectedRole === 'CHILD') router.push('/dashboard/child');
    else if (selectedRole === 'CARETAKER') router.push('/dashboard/caretaker');
    else router.push('/dashboard/doctor');
  };

  // Elder Phone OTP request
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!elderPhone || elderPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setIsOtpSent(true);
    setElderOtp('123456'); // Pre-fill demo OTP for convenience
    speak('OTP sent to your phone. Demo code is 123456.');
  };

  // Elder Phone OTP verify
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (elderOtp === '123456' || elderOtp.length === 6) {
      const success = loginWithPasscode('ELDER', '1234');
      if (success) {
        router.push('/dashboard/elder');
      } else {
        setErrorMsg('Authentication error. Please try again.');
      }
    } else {
      setErrorMsg('Invalid OTP code. Please enter 123456.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white font-sans">
      <div className="w-full max-w-md">
        {/* Back to Home */}
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
            Sign In to Your Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Choose your role to authenticate securely with Google OAuth or Phone OTP
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
                setSelectedRole(item.id as CareRole);
                setErrorMsg(null);
                setIsOtpSent(false);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                selectedRole === item.id
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Authentication Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.06)] border border-slate-200/80">
          {isUnauthorized && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Access Restricted:</strong> You must sign in to view {redirectTarget || 'this healthcare portal'}.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-shake text-center">
              {errorMsg}
            </div>
          )}

          {/* ELDER ROLE: 2 Easy Options (Phone OTP or 1-Click Google) */}
          {selectedRole === 'ELDER' ? (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-center">
                <span className="text-xs font-bold text-blue-900 block">
                  Accessible Sign-In for Seniors
                </span>
                <span className="text-[11px] text-blue-700">
                  Sign in instantly with your verified mobile number or Google account.
                </span>
              </div>

              {/* Option A: Phone Number + OTP */}
              {!isOtpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        placeholder="10-digit phone number"
                        value={elderPhone}
                        onChange={e => setElderPhone(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-semibold outline-none focus:border-blue-600 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Send Login OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Enter 6-Digit OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsOtpSent(false)}
                        className="text-[11px] text-blue-600 font-bold hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={elderOtp}
                      onChange={e => setElderOtp(e.target.value)}
                      placeholder="123456"
                      autoFocus
                      required
                      className="w-full py-3 text-center text-2xl font-mono tracking-widest rounded-2xl border-2 border-blue-400 bg-slate-50 focus:bg-white text-slate-900 font-bold outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Verify & Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium">OR</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Option B: Continue with Google for Elder */}
              <button
                type="button"
                onClick={() => handleGoogleSignInTrigger('ELDER')}
                className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-3 active:scale-98"
              >
                {/* Google SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          ) : (
            /* NON-ELDER ROLES: Child, Caretaker, Doctor (Strictly Google OAuth) */
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-800 text-lg">
                {selectedRole === 'CHILD' && '👨‍👩‍👧'}
                {selectedRole === 'CARETAKER' && '🧑‍⚕️'}
                {selectedRole === 'DOCTOR' && '🩺'}
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {selectedRole === 'CHILD' && 'Family Admin Authentication'}
                  {selectedRole === 'CARETAKER' && 'Verified Caretaker Sign-In'}
                  {selectedRole === 'DOCTOR' && 'Clinical Practitioner Sign-In'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {selectedRole === 'CHILD' && 'Full access to appointments, medical receipts, and emergency escalation settings.'}
                  {selectedRole === 'CARETAKER' && 'Time-bound daily shift duties and live photo 2FA verification.'}
                  {selectedRole === 'DOCTOR' && 'Clinical prescriptions, vital telemetry, and consecutive-miss limits.'}
                </p>
              </div>

              {/* Single Professional Google Button */}
              <button
                type="button"
                onClick={() => handleGoogleSignInTrigger(selectedRole)}
                className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-3 active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google as {selectedRole}</span>
              </button>

              <div className="text-[11px] text-slate-400 font-mono">
                Extracts your Google Profile Name & creates authenticated session
              </div>
            </div>
          )}

          {/* Registration link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Need a new account?{' '}
              <Link href="/register" className="text-blue-600 font-bold hover:underline">
                Register with OTP / Google
              </Link>
            </p>
          </div>
        </div>

        {/* Google OAuth Simulation & Name Fetcher Modal */}
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Sign in with Google
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Signing into CareSync as {selectedRole}
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmGoogleAuth} className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Your Google Account Name
                  </label>
                  <input
                    type="text"
                    placeholder={selectedRole === 'DOCTOR' ? 'Dr. Priya Nair' : selectedRole === 'CARETAKER' ? 'Ramesh Kumar' : 'Karthik Sundaram'}
                    value={googleNameInput}
                    onChange={e => setGoogleNameInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-blue-600 font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Leave blank to use default verified account name.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Google Email
                  </label>
                  <input
                    type="email"
                    placeholder="user@gmail.com"
                    value={googleEmailInput}
                    onChange={e => setGoogleEmailInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-blue-600 font-mono text-[11px]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="px-3.5 py-2 text-xs text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    {isAuthenticating ? 'Authenticating...' : 'Confirm Sign-In'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs font-bold text-slate-400">Loading CareSync Portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
