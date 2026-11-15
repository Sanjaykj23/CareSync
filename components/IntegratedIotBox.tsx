'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  Cpu, 
  Radio, 
  ShieldCheck, 
  Check, 
  Volume2, 
  Sparkles, 
  Scale, 
  Activity, 
  Lock, 
  Unlock,
  Pill,
  Clock,
  Wifi,
  SlidersHorizontal
} from 'lucide-react';

export default function IntegratedIotBox() {
  const { medications, doseLogs, simulateIotSlotDispense, speak, t } = useApp();
  const [openSlots, setOpenSlots] = useState<{ [key: number]: boolean }>({});

  const handleDispense = async (slotNumber: number) => {
    const isNowOpen = !openSlots[slotNumber];
    setOpenSlots(prev => ({ ...prev, [slotNumber]: isNowOpen }));

    if (isNowOpen) {
      speak(`Smart Dispenser: Slot 0${slotNumber} lid unlocked. Pill lifted.`);
      await simulateIotSlotDispense(slotNumber);
    } else {
      speak(`Slot 0${slotNumber} lid closed and secured.`);
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-slate-50/90 rounded-[2rem] p-5 sm:p-7 border-2 border-slate-200/80 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.06)] text-slate-800 transition-all font-sans">
      {/* 1. Hardware Casing Header (Sleek Medical-Grade Aesthetic) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-sm">
            <Cpu className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {t.iotDispenserTitle}
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                {t.online}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {t.iotDispenserDesc}
            </p>
          </div>
        </div>

        {/* OLED Mini Status Display Screen (Light Theme LCD look) */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] px-3.5 py-2 rounded-xl border border-slate-700 shadow-inner flex items-center gap-2.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>2.4GHz WiFi · 4.8g Balanced</span>
          </div>
          <span className="hidden sm:inline-flex text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl font-bold">
            POST /api/iot/telemetry
          </span>
        </div>
      </div>

      {/* 2. Visual Smart Box Body (4 Physical Compartments) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((slotNum) => {
          const med = medications.find(m => m.iot_slot_number === slotNum);
          const dose = doseLogs.find(d => d.medication_id === med?.id);
          const isVerified = dose && (dose.status === 'SENSOR_VERIFIED' || dose.status === 'DUAL_VERIFIED');
          const isLidOpen = openSlots[slotNum];

          const slotLabels: { [key: number]: { time: string; badge: string; color: string } } = {
            1: { time: '13:00', badge: 'Noon Dose', color: 'bg-amber-100 text-amber-900 border-amber-200' },
            2: { time: '08:00', badge: 'Morning Dose', color: 'bg-blue-100 text-blue-900 border-blue-200' },
            3: { time: '20:00', badge: 'Night Dose', color: 'bg-indigo-100 text-indigo-900 border-indigo-200' },
            4: { time: '08:00', badge: 'Morning Booster', color: 'bg-purple-100 text-purple-900 border-purple-200' },
          };

          const label = slotLabels[slotNum] || { time: '12:00', badge: 'Daily Dose', color: 'bg-slate-100 text-slate-800 border-slate-200' };

          return (
            <div
              key={slotNum}
              className={`relative rounded-3xl p-4 transition-all flex flex-col justify-between border-2 ${
                isVerified
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                  : isLidOpen
                  ? 'bg-blue-50/70 border-blue-400 shadow-md ring-2 ring-blue-300/40'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {/* Top Compartment Bevel & LED Indicator */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                    SLOT 0{slotNum}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${label.color}`}>
                    {label.badge}
                  </span>
                </div>

                {/* Physical LED Status Light */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3 h-3 rounded-full border-2 transition-all ${
                      isVerified
                        ? 'bg-emerald-500 border-white shadow-[0_0_10px_#10b981]'
                        : isLidOpen
                        ? 'bg-blue-500 border-white shadow-[0_0_10px_#3b82f6]'
                        : 'bg-amber-400 border-white shadow-[0_0_8px_#f59e0b]'
                    }`}
                  />
                  <span className="text-[10px] font-extrabold font-mono text-slate-500 uppercase">
                    {isVerified ? 'VERIFIED' : isLidOpen ? 'OPEN' : 'READY'}
                  </span>
                </div>
              </div>

              {/* Medicine Icon & Info */}
              <div className="my-1.5 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <Pill className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-sm truncate">
                      {med?.name || `Prescription ${slotNum}`}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-500 block truncate">
                      {med?.dosage || '1 tablet · After Food'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 pt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{med?.schedule_time?.slice(0, 5) || label.time}</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    ({med?.meal_instruction?.replace('_', ' ') || 'after food'})
                  </span>
                </div>
              </div>

              {/* Embedded Physical Sensors (Load Cell & Magnetic Reed Switch) */}
              <div className="my-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1 font-sans font-semibold text-[10px]">
                    <Scale className="w-3 h-3 text-slate-400" /> {t.loadCell}:
                  </span>
                  <span className={`font-bold ${isVerified ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {isVerified ? '0.0g (Lifted)' : '2.4g (Loaded)'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1 font-sans font-semibold text-[10px]">
                    {isLidOpen ? <Unlock className="w-3 h-3 text-blue-500" /> : <Lock className="w-3 h-3 text-slate-400" />} {t.reedSwitch}:
                  </span>
                  <span className={`font-bold ${isLidOpen ? 'text-blue-600' : 'text-slate-600'}`}>
                    {isLidOpen ? t.unsealed : t.sealed}
                  </span>
                </div>
              </div>

              {/* Tactile Hardware Dispense / Lift Pill Button */}
              <button
                type="button"
                onClick={() => handleDispense(slotNum)}
                className={`w-full py-2.5 px-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98 ${
                  isVerified
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                    : isLidOpen
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isVerified ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                    <span>{t.taken}</span>
                  </>
                ) : isLidOpen ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Close Compartment Lid</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>{t.openAndLift}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. Hardware Footer & Telemetry Guide */}
      <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Hardware events write to Supabase in real-time and alert family via Webhook.
          </span>
        </div>

        <button
          type="button"
          onClick={() => speak('Smart Dispenser connected. Compartment 1 has Amlodipine, Compartment 2 has Metformin, Compartment 3 has Atorvastatin, Compartment 4 has Vitamin D3.')}
          className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 hover:underline"
        >
          <Volume2 className="w-4 h-4" />
          <span>Dispenser Voice Guide</span>
        </button>
      </div>
    </div>
  );
}
