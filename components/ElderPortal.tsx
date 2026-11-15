'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import DigitalClock from './DigitalClock';
import IntegratedIotBox from './IntegratedIotBox';
import LinkingRequestsTray from './LinkingRequestsTray';
import Link from 'next/link';
import { 
  Bell, 
  Check, 
  Clock, 
  Heart, 
  Zap, 
  PhoneCall, 
  Users, 
  Home as HomeIcon, 
  Volume2,
  ShieldCheck,
  Cpu,
  FileText
} from 'lucide-react';

export default function ElderPortal() {
  const { 
    patient, 
    medications, 
    doseLogs, 
    takeDose, 
    snoozeDose, 
    speak,
    linkingRequests,
    respondToLinkingRequest 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'home' | 'pills' | 'family' | 'iot'>('home');

  // Real-time slot initialization based on current hour
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'noon' | 'evening' | 'night'>(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'noon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  });

  const [showSosModal, setShowSosModal] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [isSosCalling, setIsSosCalling] = useState(false);

  // Filter pending requests for this elder
  const pendingRequests = linkingRequests.filter(r => r.status === 'PENDING' && (!r.patient_id || r.patient_id === patient.id));
  const pendingRequestsCount = pendingRequests.length;

  // Dynamically resolve active pill based on selected time slot
  const slotPills = {
    morning: medications.filter(m => {
      const h = parseInt(m.schedule_time.slice(0, 2), 10);
      return h >= 5 && h < 12;
    }),
    noon: medications.filter(m => {
      const h = parseInt(m.schedule_time.slice(0, 2), 10);
      return h >= 12 && h < 17;
    }),
    evening: medications.filter(m => {
      const h = parseInt(m.schedule_time.slice(0, 2), 10);
      return h >= 17 && h < 21;
    }),
    night: medications.filter(m => {
      const h = parseInt(m.schedule_time.slice(0, 2), 10);
      return h >= 21 || h < 5;
    }),
  };

  const activePill = slotPills[selectedTimeSlot]?.[0] || medications[0];
  const activeDose = doseLogs.find(d => d.medication_id === activePill?.id && d.status === 'SCHEDULED');
  const isTaken = activeDose ? false : true;

  const takenCount = doseLogs.filter(d => d.status !== 'SCHEDULED' && d.status !== 'MISSED').length;
  const totalCount = doseLogs.length || 4;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSosModal && sosCountdown > 0 && !isSosCalling) {
      timer = setTimeout(() => {
        setSosCountdown(prev => prev - 1);
      }, 1000);
    } else if (showSosModal && sosCountdown === 0 && !isSosCalling) {
      setIsSosCalling(true);
      speak('Emergency alert activated. Calling ambulance and notifying family.');
    }
    return () => clearTimeout(timer);
  }, [showSosModal, sosCountdown, isSosCalling, speak]);

  const triggerSos = () => {
    setShowSosModal(true);
    setSosCountdown(5);
    setIsSosCalling(false);
    speak('Emergency triggered. Ambulance countdown started. Tap Cancel if you are okay.');
  };

  const cancelSos = () => {
    setShowSosModal(false);
    setSosCountdown(5);
    setIsSosCalling(false);
    speak('Emergency cancelled.');
  };

  return (
    <div className="relative min-h-[calc(100vh-60px)] pb-32 pt-4 px-3 sm:px-6 max-w-5xl mx-auto space-y-6">
      {/* 1. Header with greeting, ABHA status and notification bell */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gradient-to-tr from-amber-200 to-orange-300 flex items-center justify-center text-amber-900 font-bold text-lg">
            👴
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Hi, {patient.name.split(' ')[0]}
              </h1>
              {patient.abha_id ? (
                <Link
                  href="/abdm"
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1 hover:bg-blue-200 transition-all"
                >
                  <ShieldCheck className="w-3 h-3 text-blue-600" /> ABHA Active
                </Link>
              ) : (
                <Link
                  href="/abdm"
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all"
                >
                  <ShieldCheck className="w-3 h-3 text-slate-400" /> Link ABHA (Optional)
                </Link>
              )}
            </div>
            <p className="text-xs font-medium text-slate-500">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} · +91 {patient.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => speak(`You have taken ${takenCount} of ${totalCount} pills today. Next dose is ${activePill?.name} at ${activePill?.schedule_time?.slice(0, 5) || '1 PM'}.`)}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-soft flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all"
            title="Read schedule aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className="relative w-10 h-10 rounded-full bg-white border border-slate-200 shadow-soft flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all"
            title="Care Circle Linking Requests"
          >
            <Bell className="w-5 h-5" />
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Immediate High-Visibility Care Circle Notifications Banner (Shown right at the beginning) */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          {pendingRequests.map(req => (
            <div 
              key={req.id} 
              className="p-4 sm:p-5 rounded-3xl bg-blue-50 border-2 border-blue-300 shadow-sm flex flex-wrap items-center justify-between gap-4 animate-fadeIn"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-blue-200 flex items-center justify-center text-2xl shadow-sm">
                  {req.requester_role === 'CHILD' ? '👨‍👩‍👧' : req.requester_role === 'DOCTOR' ? '🩺' : '🧑‍⚕️'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900">
                      {req.requester_name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-200/80 text-blue-900 uppercase">
                      {req.requester_role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    {req.message || `Wants to join your Care Circle to help manage medications.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => respondToLinkingRequest(req.id, 'ACCEPTED')}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm transition-all active:scale-98"
                >
                  ✓ Accept Request
                </button>
                <button
                  onClick={() => respondToLinkingRequest(req.id, 'REJECTED')}
                  className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs transition-all"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Direct On-Screen IoT Pillbox Dispenser */}
      <IntegratedIotBox />

      {/* 3. Main Content: Active Hero Pill Card & Metrics */}
      {activeTab === 'home' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Active Pill Card & Time Pills */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Time for your <span className="text-blue-600">
                  {selectedTimeSlot === 'morning' ? 'morning pills' : selectedTimeSlot === 'noon' ? 'afternoon pills' : selectedTimeSlot === 'evening' ? 'evening pills' : 'night pills'}
                </span>
              </h2>
            </div>

            {/* Giant Hero Card for Active Pill */}
            <div className="relative bg-white rounded-4xl p-6 sm:p-8 shadow-soft border border-slate-100/80 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  {isTaken ? 'Completed' : 'In 25 min'}
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Dispenser Slot {activePill?.iot_slot_number || 1}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <DigitalClock value={activePill?.schedule_time?.slice(0, 5) || '13:00'} size="giant" color="dark" />
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                    {activePill?.name}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    {activePill?.dosage} · {activePill?.meal_instruction?.replace('_', ' ') || 'after food'}
                  </p>
                </div>

                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-blue-100 to-sky-50 flex items-center justify-center p-3 shadow-inner relative group">
                  <div className="w-16 h-8 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-300 rounded-full transform -rotate-45 shadow-lg shadow-blue-500/30 flex items-center justify-center text-white text-[10px] font-bold">
                    Rx
                  </div>
                  <span className="absolute bottom-2 right-2 text-xs text-blue-400">💊</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={() => {
                    if (activeDose) {
                      takeDose(activeDose.id, 'MANUAL');
                    } else if (doseLogs[0]) {
                      takeDose(doseLogs[0].id, 'MANUAL');
                    }
                  }}
                  disabled={isTaken}
                  className={`flex-1 py-4 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isTaken
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-slate-900 hover:bg-slate-800 active:scale-98 text-white shadow-slate-900/10'
                  }`}
                >
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>{isTaken ? '✓ Taken on time' : 'I took it'}</span>
                </button>

                {!isTaken && (
                  <button
                    onClick={() => {
                      if (activeDose) snoozeDose(activeDose.id);
                    }}
                    className="py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-98 font-bold text-slate-700 text-base transition-all"
                  >
                    Later
                  </button>
                )}
              </div>
            </div>

            {/* Time Segments */}
            <div className="grid grid-cols-4 gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-soft">
              {[
                { id: 'morning', label: 'Morning', icon: '✓' },
                { id: 'noon', label: 'Noon', icon: '13:00' },
                { id: 'evening', label: 'Evening', icon: '19:00' },
                { id: 'night', label: 'Night', icon: '20:00' },
              ].map(slot => {
                const isSelected = selectedTimeSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => {
                      setSelectedTimeSlot(slot.id as any);
                      speak(slot.label);
                    }}
                    className={`py-2.5 px-1 rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{slot.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Today's Pills & Metrics */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Today's Pills Card */}
            <div className="bg-white rounded-4xl p-6 shadow-soft border border-slate-100/80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Today&apos;s pills
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {takenCount} of {totalCount} taken
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {medications.map(med => {
                  const dose = doseLogs.find(d => d.medication_id === med.id);
                  const isDone = dose && (dose.status === 'SENSOR_VERIFIED' || dose.status === 'DUAL_VERIFIED');

                  return (
                    <div
                      key={med.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isDone
                          ? 'bg-slate-50/60 border-slate-200/60'
                          : 'bg-white border-blue-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                          isDone ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'
                        }`}>
                          💊
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {med.name} {med.dosage.split('·')[0]}
                          </div>
                          <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {med.schedule_time.slice(0, 5)} · {med.meal_instruction.replace('_', ' ')}
                          </div>
                        </div>
                      </div>

                      {isDone ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (dose) takeDose(dose.id, 'MANUAL');
                          }}
                          className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20"
                        >
                          Take
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-soft border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500 mb-2">
                  <Heart className="w-4 h-4 fill-rose-500" />
                  <span>Heart rate</span>
                </div>
                <DigitalClock value="72" size="md" color="dark" suffix="bpm" />
                <div className="flex items-end gap-1 h-8 mt-3 mb-1">
                  {[40, 60, 55, 75, 70, 85, 72].map((val, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${val}%` }}
                      className="flex-1 bg-rose-200 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-emerald-600">
                  ● Normal all week
                </span>
              </div>

              <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-soft text-white">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2">
                  <Zap className="w-4 h-4 fill-amber-400" />
                  <span>This week</span>
                </div>
                <div className="text-white">
                  <DigitalClock value="92" size="md" color="blue" suffix="%" className="text-white" />
                </div>
                <div className="flex items-center gap-1.5 mt-3 mb-1">
                  {[true, true, true, true, true, true, false].map((active, i) => (
                    <span
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-lime-400' : 'bg-slate-700'}`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-slate-300">
                  6-day streak!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Care Circle & Consent Requests Tab */}
      {activeTab === 'family' && (
        <div className="space-y-6">
          <LinkingRequestsTray />
        </div>
      )}

      {/* 5. Bottom Sticky Navigation with Giant Glowing SOS Pill Button */}
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-30">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-full py-2 px-3 shadow-float flex items-center justify-between">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-full transition-all ${
              activeTab === 'home'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`relative flex flex-col items-center gap-1 py-1 px-4 rounded-full transition-all ${
              activeTab === 'family'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </button>

          <Link
            href="/abdm"
            className="flex flex-col items-center gap-1 py-1 px-4 rounded-full text-slate-500 hover:text-slate-900 transition-all"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-[10px]">ABHA</span>
          </Link>

          {/* Giant Glowing Red SOS Floating Action Button */}
          <button
            onClick={triggerSos}
            className="w-14 h-14 -my-3 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white font-black text-sm tracking-wider shadow-lg shadow-red-500/40 flex items-center justify-center transition-all transform active:scale-95 animate-pulse"
          >
            SOS
          </button>
        </div>
      </nav>

      {/* 6. Emergency SOS Full-Screen Overlay Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-red-600 via-red-600 to-rose-700 text-white flex flex-col justify-between p-6 sm:p-10 animate-fadeIn">
          <div className="flex flex-col items-center text-center mt-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold tracking-wide uppercase mb-3 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              Emergency
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Calling an ambulance in
            </h2>
          </div>

          <div className="my-auto flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 rounded-full bg-white/10 border-4 border-white/30 flex items-center justify-center shadow-2xl animate-pulse">
              <span className="font-mono text-7xl font-black text-white tracking-widest">
                0{sosCountdown}
              </span>
            </div>
            <p className="text-sm font-medium text-white/90 mt-6 text-center max-w-xs">
              Karthik, Ramesh, and Dr. Priya are being notified with your exact GPS location.
            </p>
          </div>

          <div className="bg-red-900/40 backdrop-blur-md border border-white/20 rounded-3xl p-4 max-w-md mx-auto w-full mb-6">
            <div className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
              Medical card shared with paramedics
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm font-medium">
              <div>
                <span className="text-white/60 text-xs block">Blood Type</span>
                <span className="font-bold text-white text-base">O+ (Rh+)</span>
              </div>
              <div>
                <span className="text-white/60 text-xs block">Allergies</span>
                <span className="font-bold text-white text-base">Penicillin</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
            <button
              onClick={() => {
                setIsSosCalling(true);
                speak('Calling emergency ambulance 108 immediately.');
              }}
              className="w-full py-4 rounded-2xl bg-white text-red-600 font-extrabold text-base flex items-center justify-center gap-2 shadow-lg hover:bg-slate-50 transition-all active:scale-98"
            >
              <PhoneCall className="w-5 h-5" />
              Call right now (108)
            </button>

            <button
              onClick={cancelSos}
              className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-sm transition-all active:scale-98"
            >
              Cancel, I&apos;m OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
