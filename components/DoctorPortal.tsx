'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  Stethoscope, 
  Activity, 
  Edit3, 
  Save, 
  CheckCircle, 
  Clock, 
  Sliders, 
  TrendingUp, 
  ShieldCheck 
} from 'lucide-react';

export default function DoctorPortal() {
  const { 
    patient, 
    medications, 
    doseLogs, 
    updatePrescription, 
    speak 
  } = useApp();

  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [newDosage, setNewDosage] = useState('');
  const [newScheduleTime, setNewScheduleTime] = useState('');
  const [newMealInstruction, setNewMealInstruction] = useState<'before_food' | 'after_food' | 'with_food' | 'any_time'>('after_food');
  const [newThreshold, setNewThreshold] = useState<number>(patient.emergency_threshold);

  const startEdit = (med: any) => {
    setEditingMedId(med.id);
    setNewDosage(med.dosage);
    setNewScheduleTime(med.schedule_time);
    setNewMealInstruction(med.meal_instruction);
  };

  const handleSaveRx = (medId: string) => {
    updatePrescription(medId, {
      dosage: newDosage,
      schedule_time: newScheduleTime,
      meal_instruction: newMealInstruction,
    });
    setEditingMedId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Clinical Portal
            </span>
            <span className="text-xs text-slate-400">· Apollo Speciality Hospitals</span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            Dr. Priya Nair, MD (Cardiology)
          </h1>
          <p className="text-sm text-slate-400">
            Clinical Supervisor for Patient: {patient.name} (ABHA: {patient.abha_id})
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2.5">
          <Activity className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Adherence Score</span>
            <span className="font-mono font-black text-emerald-400 text-lg">92% (High)</span>
          </div>
        </div>
      </div>

      {/* Adherence & Thresholds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100">
          <div className="flex items-center gap-2 mb-2 text-slate-900 font-extrabold text-base">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3>Adherence & Vital Telemetry</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Continuous sync via IoT smart dispenser and caretaker 2FA verification.
          </p>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Last 30 Days</span>
              <span className="font-mono font-extrabold text-slate-900 text-2xl">96.4%</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Excellent</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Mean Resting HR</span>
              <span className="font-mono font-extrabold text-slate-900 text-2xl">72 bpm</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Stable</span>
            </div>
          </div>
        </div>

        {/* Consecutive Miss Threshold Setter */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100">
          <div className="flex items-center gap-2 mb-2 text-slate-900 font-extrabold text-base">
            <Sliders className="w-5 h-5 text-amber-600" />
            <h3>Consecutive Miss Safety Limit</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Sets the threshold for automatic Code-Red dispatch to emergency contacts.
          </p>

          <div className="flex items-center gap-3">
            {[1, 2, 3].map(val => (
              <button
                key={val}
                onClick={() => {
                  setNewThreshold(val);
                  speak(`Emergency miss threshold updated to ${val} misses.`);
                }}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all border ${
                  newThreshold === val
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {val} {val === 1 ? 'Miss (Strict)' : 'Misses'}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 block mt-3">
            Currently configured for cardiac patient protocol ({newThreshold} misses max).
          </span>
        </div>
      </div>

      {/* Prescription Management Table */}
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <h3>Prescription Orders & Slot Mapping</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {medications.length} Active Prescriptions
          </span>
        </div>

        <div className="space-y-4">
          {medications.map(med => {
            const isEditing = editingMedId === med.id;

            return (
              <div 
                key={med.id}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-base">{med.name}</h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Slot {med.iot_slot_number}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {med.dosage} · Scheduled {med.schedule_time.slice(0, 5)} IST ({med.meal_instruction.replace('_', ' ')})
                    </p>
                  </div>

                  <div>
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveRx(med.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Save className="w-4 h-4" /> Save Rx
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(med)}
                        className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Adjust Rx
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Rx Editor */}
                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Dosage</label>
                      <input
                        type="text"
                        value={newDosage}
                        onChange={e => setNewDosage(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Time (HH:mm:ss)</label>
                      <input
                        type="text"
                        value={newScheduleTime}
                        onChange={e => setNewScheduleTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Meal Instruction</label>
                      <select
                        value={newMealInstruction}
                        onChange={e => setNewMealInstruction(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="after_food">After Food</option>
                        <option value="before_food">Before Food</option>
                        <option value="with_food">With Food</option>
                        <option value="any_time">Any Time</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
