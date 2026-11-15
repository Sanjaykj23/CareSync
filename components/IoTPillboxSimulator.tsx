'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Cpu, X, Check, AlertCircle, Radio, Sparkles } from 'lucide-react';

interface IoTPillboxSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IoTPillboxSimulator({ isOpen, onClose }: IoTPillboxSimulatorProps) {
  const { medications, doseLogs, simulateIotSlotDispense, speak } = useApp();
  const [openSlots, setOpenSlots] = useState<{ [key: number]: boolean }>({});

  if (!isOpen) return null;

  const handleToggleLid = async (slotNumber: number) => {
    const isNowOpen = !openSlots[slotNumber];
    setOpenSlots(prev => ({ ...prev, [slotNumber]: isNowOpen }));

    if (isNowOpen) {
      speak(`IoT Hardware: Compartment ${slotNumber} opened. Pill lifted.`);
      await simulateIotSlotDispense(slotNumber);
    } else {
      speak(`IoT Hardware: Compartment ${slotNumber} closed.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-4xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white">
                ESP32 Smart Pillbox Hardware Simulator
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates magnetic reed switches, load cell weight triggers, and 4 RGB status LEDs.
            </p>
          </div>
        </div>

        {/* 4 Physical Compartments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          {[1, 2, 3, 4].map(slotNum => {
            const med = medications.find(m => m.iot_slot_number === slotNum);
            const dose = doseLogs.find(d => d.medication_id === med?.id);
            const isVerified = dose && (dose.status === 'SENSOR_VERIFIED' || dose.status === 'DUAL_VERIFIED');
            const isLidOpen = openSlots[slotNum];

            return (
              <div
                key={slotNum}
                className={`p-4 rounded-3xl border transition-all ${
                  isLidOpen
                    ? 'bg-slate-800 border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                {/* Compartment Header & LED Indicator */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      SLOT #{slotNum}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {med?.name || `Slot ${slotNum}`}
                    </span>
                  </div>

                  {/* Physical RGB LED Indicator */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                        isVerified
                          ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                          : isLidOpen
                          ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
                          : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                      }`}
                    />
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {isVerified ? 'VERIFIED' : isLidOpen ? 'DISPENSING' : 'READY'}
                    </span>
                  </div>
                </div>

                {/* Pill Details */}
                <p className="text-xs text-slate-400">
                  {med?.dosage} · Scheduled {med?.schedule_time.slice(0, 5)}
                </p>

                {/* Sensor Telemetry Stats */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                  <div>
                    <span className="text-slate-500 block">Reed Switch:</span>
                    <span className={isLidOpen ? 'text-cyan-400 font-bold' : 'text-slate-300'}>
                      {isLidOpen ? 'OPEN (Active LOW)' : 'CLOSED (HIGH)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Weight Sensor:</span>
                    <span className={isVerified ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {isVerified ? '0.0g (LIFTED)' : '2.4g (DETECTED)'}
                    </span>
                  </div>
                </div>

                {/* Hardware Interaction Buttons */}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleLid(slotNum)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      isLidOpen
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
                    }`}
                  >
                    <span>{isLidOpen ? 'Close Lid' : 'Open Lid & Lift Pill'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vercel REST Webhook Note */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Target: POST /api/iot/telemetry (Vercel Serverless Compatible)</span>
          </div>
          <span className="text-slate-500 hidden sm:inline">200 OK</span>
        </div>
      </div>
    </div>
  );
}
