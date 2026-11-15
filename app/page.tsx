'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { 
  ShieldCheck, 
  Cpu, 
  HeartHandshake, 
  Lock, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  PhoneCall, 
  CheckCircle2, 
  Users, 
  FileCheck2,
  BellRing,
  Stethoscope,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default function HomePage() {
  const { currentRole, currentUser } = useApp();
  const dashboardHref = currentRole ? `/dashboard/${currentRole.toLowerCase()}` : '/login';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col font-sans">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center shadow-md group-hover:bg-blue-600 transition-all">
              CS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">CareSync</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  ABDM Ready
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:block">
                Smart Elderly Care & Medication Management
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#innovations" className="hover:text-slate-900 transition-all">Innovations</a>
            <a href="#dispenser" className="hover:text-slate-900 transition-all">IoT Dispenser</a>
            <Link href="/abdm" className="hover:text-slate-900 transition-all">ABDM Health Locker</Link>
            <Link href="/dashboard/audit" className="hover:text-slate-900 transition-all">Immutable Audit</Link>
          </nav>

          {/* Authentication Actions */}
          <div className="flex items-center gap-2.5">
            {currentRole && currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden sm:inline text-xs text-slate-500 font-medium">
                  Active: <strong className="text-slate-900 font-bold">{currentUser.name}</strong> ({currentRole})
                </span>
                <Link
                  href={dashboardHref}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Open Dashboard</span>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-sm text-xs font-semibold text-slate-700 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Makers Need More (MnM) Healthcare Hackathon — Round 2</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Empowering Elderly Independence with{' '}
            <span className="text-blue-600">Smart Care Circles</span> & IoT Precision.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            A collaborative healthcare platform built around the senior individual. Featuring high-contrast 
            tactile reminders, an interconnected 4-slot hardware dispenser, NHA ABDM Sandbox integration, and 
            LinkedIn-style family consent.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            {currentRole ? (
              <Link
                href={dashboardHref}
                className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-98"
              >
                <span>Resume {currentRole} Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-98"
                >
                  <span>Access Role Portals</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/register"
                  className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm transition-all flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Create Patient or Care Account</span>
                </Link>
              </>
            )}
          </div>

          {/* Value Props Bar */}
          <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm">
              <span className="text-xs font-bold text-slate-400 block mb-1">01. ELDER CENTRIC</span>
              <div className="font-extrabold text-slate-900 text-sm">Vocal TTS & Dot-Matrix Time</div>
              <p className="text-[11px] text-slate-500 mt-1">64px touch targets & giant tactile buttons</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm">
              <span className="text-xs font-bold text-slate-400 block mb-1">02. HARDWARE IOT</span>
              <div className="font-extrabold text-slate-900 text-sm">4-Slot Smart Dispenser</div>
              <p className="text-[11px] text-slate-500 mt-1">Magnetic reed switches & weight telemetry</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm">
              <span className="text-xs font-bold text-slate-400 block mb-1">03. INDIAN HEALTHCARE</span>
              <div className="font-extrabold text-slate-900 text-sm">NHA ABDM Sandbox M1–M3</div>
              <p className="text-[11px] text-slate-500 mt-1">Verified ABHA ID & DPDP-compliant consent</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm">
              <span className="text-xs font-bold text-slate-400 block mb-1">04. IMMUTABLE AUDIT</span>
              <div className="font-extrabold text-slate-900 text-sm">Append-Only Ledger</div>
              <p className="text-[11px] text-slate-500 mt-1">PostgreSQL trigger blocks updates & deletes</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 4 Roles Breakdown */}
      <section className="py-16 px-4 sm:px-8 bg-white border-y border-slate-200/70">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              One Unified Platform · 4 Scoped Roles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Each user enjoys a personalized portal tailored strictly to their responsibilities and security clearances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Role 1: Elder */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:border-blue-400 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl mb-4 font-bold">
                  👵
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Elderly Individual</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Giant tactile 1-click &apos;I took it&apos; confirmation, audible Web Speech prompts, on-screen IoT dispenser, and emergency SOS with paramedic medical card.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500">Auth: Phone OTP or Google</span>
                <Link href="/login" className="text-blue-600 font-bold hover:underline">
                  View Demo →
                </Link>
              </div>
            </div>

            {/* Role 2: Child */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:border-emerald-400 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl mb-4 font-bold">
                  👨‍👩‍👧
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Family Admin (Child)</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Manages auto-expiring Travel Mode, clinical appointment bookings, pharmacy receipts, and custom consecutive-miss alert thresholds.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500">Auth: Google OAuth</span>
                <Link href="/login" className="text-emerald-600 font-bold hover:underline">
                  View Demo →
                </Link>
              </div>
            </div>

            {/* Role 3: Caretaker */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:border-purple-400 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl mb-4 font-bold">
                  🧑‍⚕️
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Verified Caretaker</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Time-bound shift PIN. Strictly limited to today&apos;s medication intake and live camera 2FA proof submission. Financials and doctor prescriptions remain locked.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500">Auth: Google OAuth</span>
                <Link href="/login" className="text-purple-600 font-bold hover:underline">
                  View Demo →
                </Link>
              </div>
            </div>

            {/* Role 4: Doctor */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:border-amber-400 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl mb-4 font-bold">
                  🩺
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Attending Doctor</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Adherence telemetry, missed dose trend graphs, prescription order adjustments, and safety threshold limits.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500">Auth: Google OAuth</span>
                <Link href="/login" className="text-amber-600 font-bold hover:underline">
                  View Demo →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Innovation Highlight: LinkedIn-Style Care Consent & ABDM */}
      <section id="innovations" className="py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <HeartHandshake className="w-4 h-4" />
              <span>Ethical Healthcare Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              Elders Decide Who Joins Their Care Circle.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Unlike invasive surveillance tools, CareSync treats the elderly individual as the primary decision-maker. 
              When a doctor or caretaker registers, they send a <strong>Linking Request</strong>. 
              The elder must explicitly click <strong>&quot;Accept Access&quot;</strong> before anyone can review their vital telemetry or medication records.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Multi-tenant family circle isolation: logs are strictly scoped to patient ID</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ayushman Bharat Digital Mission (ABDM) sandbox integration</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Append-only PostgreSQL audit trail blocking UPDATE & DELETE</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/abdm"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm"
              >
                <span>Explore ABDM Health Locker</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Interactive Card Mockup */}
          <div className="bg-white rounded-4xl p-6 sm:p-7 shadow-float border border-slate-200/80">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-extrabold text-slate-900">Live Care Request Simulation</span>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                Consent Gateway
              </span>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-sm shrink-0">
                  🩺
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Dr. Priya Nair (Cardiologist)</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    &quot;Requesting clinical access to review blood pressure trends & adjust Amlodipine dosage.&quot;
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-bold text-[11px]">
                      Accept Access
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-[11px]">
                      Decline
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 text-center">
              Elders can also use their vocal assistant to accept: &quot;Yes, add Dr. Priya to my circle.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">CareSync</span>
            <span>· Built for Makers Need More (MnM) Healthcare Hackathon</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-900 font-bold">Sign In</Link>
            <Link href="/register" className="hover:text-slate-900 font-bold">Register with OTP</Link>
            <Link href="/abdm" className="hover:text-slate-900 font-bold">ABDM Portal</Link>
            <Link href="/dashboard/audit" className="hover:text-slate-900 font-bold">Audit Ledger</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
