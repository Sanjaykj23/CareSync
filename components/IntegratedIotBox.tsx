'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Cpu, Radio, ShieldCheck, Check, Volume2, CircleDot } from 'lucide-react';

export default function IntegratedIotBox() {
  const { medications, doseLogs, simulateIotSlotDispense, speak } = useApp();
  const [openSlots, setOpenSlots] = useState<{ [key: number]: boolean }>({});

  const handleDispense = async (slotNumber: number) => {
    const isNowOpen = !openSlots[slotNumber];
    setOpenSlots(prev => ({ ...prev, [slotNumber]: isNowOpen }));

    if (isNowOpen) {
      speak(`Smart Dispenser: Slot ${slotNumber} opened. Pill lifted.`);
      await simulateIotSlotDispense(slotNumber);
    } else {
      speak(`Slot ${slotNumber} lid closed.`);
    }
  };

  return (
    <div className="bg-[#0F141C] text-slate-100 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
      {/* Hardware Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Cpu className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                ESP32 Smart Dispenser Telemetry
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              4 Physical compartments with reed switches & load cell verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-300 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-blue-400" />
            <span>POST /api/iot/telemetry</span>
          </span>
        </div>
      </div>

      {/* 4 Hardware Compartments */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((slotNum) => {
          const med = medications.find(m => m.iot_slot_number === slotNum);
          const dose = doseLogs.find(d => d.medication_id === med?.id);
          const isVerified = dose && (dose.status === 'SENSOR_VERIFIED' || dose.status === 'DUAL_VERIFIED');
          const isLidOpen = openSlots[slotNum];

          return (
            <div
              key={slotNum}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                isLidOpen
                  ? 'bg-[#18202C] border-blue-500/80 shadow-md shadow-blue-500/10'
                  : 'bg-[#141A23] border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Slot Header with LED Indicator Diode */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  SLOT 0{slotNum}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isVerified
                        ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                        : isLidOpen
                        ? 'bg-blue-400 shadow-[0_0_8px_#60a5fa]'
                        : 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
                    }`}
                  />
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                    {isVerified ? 'VERIFIED' : isLidOpen ? 'OPEN' : 'READY'}
                  </span>
                </div>
              </div>

              {/* Medication Details */}
              <div className="my-2">
                <div className="font-bold text-white text-sm truncate">
                  {med?.name || `Slot ${slotNum}`}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {med?.schedule_time.slice(0, 5)} · {med?.dosage.split('·')[0]}
                </div>
              </div>

              {/* Physical Sensor Readout */}
              <div className="text-[10px] font-mono text-slate-400 my-1 bg-[#0B0F15] p-2 rounded-xl border border-slate-800/80 space-y-0.5">
                <div className="flex justify-between">
                  <span>Load Cell:</span>
                  <span className={isVerified ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                    {isVerified ? '0.0g' : '2.4g'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reed Switch:</span>
                  <span className={isLidOpen ? 'text-blue-400 font-bold' : 'text-slate-400'}>
                    {isLidOpen ? 'LOW (Open)' : 'HIGH (Closed)'}
                  </span>
                </div>
              </div>

              {/* Clean Hardware Button (Not AI-Looking!) */}
              <button
                onClick={() => handleDispense(slotNum)}
                className={`mt-2 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98 ${
                  isVerified
                    ? 'bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 cursor-default'
                    : isLidOpen
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                    : 'bg-[#1C2533] hover:bg-[#242F40] text-slate-200 border border-slate-700/80'
                }`}
              >
                {isVerified ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Taken
                  </>
                ) : (
                  <span>{isLidOpen ? 'Close Compartment' : 'Open & Lift Pill'}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Hardware triggers write to Supabase and immediately notify Family Circle.
        </span>
        <button
          onClick={() => speak('Smart dispenser connected. Slot 1 Amlodipine, Slot 2 Metformin, Slot 3 Atorvastatin, Slot 4 Vitamin D3.')}
          className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
        >
          <Volume2 className="w-3.5 h-3.5" /> Audio Guide
        </button>
      </div>
    </div>
  );
}
