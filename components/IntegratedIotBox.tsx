'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Cpu, Radio, ShieldCheck, Check, Volume2 } from 'lucide-react';

export default function IntegratedIotBox() {
  const { medications, doseLogs, simulateIotSlotDispense, speak } = useApp();
  const [openSlots, setOpenSlots] = useState<{ [key: number]: boolean }>({});
  const [animatingSlot, setAnimatingSlot] = useState<number | null>(null);

  const handleDispense = async (slotNumber: number) => {
    setAnimatingSlot(slotNumber);
    const isNowOpen = !openSlots[slotNumber];
    setOpenSlots(prev => ({ ...prev, [slotNumber]: isNowOpen }));

    if (isNowOpen) {
      speak(`Smart Pillbox Slot ${slotNumber} opened. Pill taken.`);
      await simulateIotSlotDispense(slotNumber);
    } else {
      speak(`Slot ${slotNumber} lid closed.`);
    }

    setTimeout(() => {
      setAnimatingSlot(null);
    }, 800);
  };

  return (
    <div className="bg-slate-900 text-white rounded-4xl p-6 sm:p-7 shadow-float border border-slate-800 relative overflow-hidden">
      {/* Background subtle neon glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header with live hardware status */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black tracking-tight text-white">
                ESP32 Smart Dispenser Box
              </h3>
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live hardware telemetry · 4 Active sensor compartments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            Auto-Sync Active
          </span>
        </div>
      </div>

      {/* 4 Physical Compartment Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((slotNum) => {
          const med = medications.find(m => m.iot_slot_number === slotNum);
          const dose = doseLogs.find(d => d.medication_id === med?.id);
          const isVerified = dose && (dose.status === 'SENSOR_VERIFIED' || dose.status === 'DUAL_VERIFIED');
          const isLidOpen = openSlots[slotNum];
          const isAnimating = animatingSlot === slotNum;

          // LED status color logic
          let ledColor = 'bg-amber-400 shadow-[0_0_10px_#fbbf24]';
          let statusText = 'READY';

          if (isVerified) {
            ledColor = 'bg-emerald-400 shadow-[0_0_12px_#34d399]';
            statusText = 'TAKEN';
          } else if (isLidOpen) {
            ledColor = 'bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse';
            statusText = 'LIFTED';
          }

          return (
            <div
              key={slotNum}
              className={`p-4 rounded-3xl border transition-all flex flex-col justify-between ${
                isLidOpen
                  ? 'bg-slate-800/90 border-cyan-400/80 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Slot Header & RGB LED */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  SLOT {slotNum}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full transition-all duration-300 ${ledColor}`} />
                  <span className="text-[9px] font-mono font-bold text-slate-300 uppercase">
                    {statusText}
                  </span>
                </div>
              </div>

              {/* Medication Name & Time */}
              <div className="my-2">
                <div className="font-extrabold text-white text-sm tracking-tight truncate">
                  {med?.name || `Slot ${slotNum}`}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {med?.schedule_time.slice(0, 5)} · {med?.dosage.split('·')[0]}
                </div>
              </div>

              {/* Sensor stats */}
              <div className="text-[10px] font-mono text-slate-400 my-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800/60">
                <div className="flex justify-between">
                  <span>Weight:</span>
                  <span className={isVerified ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                    {isVerified ? '0.0g' : '2.4g'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lid:</span>
                  <span className={isLidOpen ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                    {isLidOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
              </div>

              {/* Interactive Tactile Trigger */}
              <button
                onClick={() => handleDispense(slotNum)}
                className={`mt-2 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  isVerified
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300 cursor-default'
                    : isLidOpen
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 active:scale-95'
                }`}
              >
                {isVerified ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Taken
                  </>
                ) : (
                  <span>{isLidOpen ? 'Close Lid' : 'Open & Lift'}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Hardware events automatically update this website and sync to Family Portal.
        </span>
        <button
          onClick={() => speak('Smart dispenser is connected. Slot 1 holds Amlodipine, Slot 2 Metformin, Slot 3 Atorvastatin, Slot 4 Vitamin D3.')}
          className="text-cyan-400 hover:underline flex items-center gap-1"
        >
          <Volume2 className="w-3 h-3" /> Voice Guide
        </button>
      </div>
    </div>
  );
}
