'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Search, HeartHandshake, CheckCircle, X, ShieldAlert, User, ArrowRight, Phone } from 'lucide-react';

interface ConnectElderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectElderModal({ isOpen, onClose }: ConnectElderModalProps) {
  const { patient, currentUser, sendLinkingRequest, speak } = useApp();
  const [searchPhone, setSearchPhone] = useState('');
  const [searchedPatient, setSearchedPatient] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setSearchedPatient(null);
    setIsSearching(true);

    const clean = searchPhone.replace(/\D/g, '');
    if (clean.length < 10) {
      setSearchError('Please enter a valid 10-digit mobile number.');
      setIsSearching(false);
      return;
    }

    const client = supabase;
    let found = false;

    // 1. Search in Supabase patient_profiles
    if (isSupabaseConfigured && client) {
      try {
        const { data: dbPatients } = await client
          .from('patient_profiles')
          .select('*')
          .or(`phone.eq.${clean},phone.ilike.%${clean.slice(-10)}%`);

        if (dbPatients && dbPatients.length > 0) {
          setSearchedPatient(dbPatients[0]);
          speak(`Found elder ${dbPatients[0].name}`);
          found = true;
        }
      } catch (err) {
        console.error('Database search error:', err);
      }
    }

    // 2. Fallback search against active patient
    if (!found) {
      if (patient && (patient.phone.replace(/\D/g, '').endsWith(clean.slice(-10)) || clean === patient.phone)) {
        setSearchedPatient(patient);
        speak(`Found elder ${patient.name}`);
        found = true;
      }
    }

    if (!found) {
      setSearchError(`No registered elder found with phone +91 ${clean}. Please verify the number or ask the elder to register on CareSync first.`);
    }

    setIsSearching(false);
  };

  const handleSendRequest = async () => {
    if (!searchedPatient) return;
    setIsSending(true);
    const senderName = currentUser?.name || 'A verified member';
    const senderRole = currentUser?.role || 'CHILD';
    const msg = customMessage || `${senderName} (${senderRole}) is requesting authorization to join your Care Circle.`;
    const res = await sendLinkingRequest(searchedPatient.phone, msg);
    setIsSending(false);

    if (res.success) {
      setRequestSent(true);
      setTimeout(() => {
        onClose();
        setRequestSent(false);
        setSearchedPatient(null);
        setSearchPhone('');
      }, 2000);
    } else {
      setSearchError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Connect to Elder&apos;s Care Circle
            </h3>
            <p className="text-xs text-slate-500">
              Search by the senior&apos;s mobile number to send a connection request.
            </p>
          </div>
        </div>

        {requestSent ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h4 className="font-bold text-emerald-950 text-sm">Linking Request Dispatched</h4>
            <p className="text-xs text-emerald-700">
              Elder {searchedPatient?.name} will receive a prompt directly on their home screen to accept your connection.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Input Form */}
            <form onSubmit={handleSearch} className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Elder&apos;s Registered Mobile Number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="Enter 10-digit number (e.g. 9840123456)"
                    value={searchPhone}
                    onChange={e => setSearchPhone(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold outline-none focus:border-blue-600 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all disabled:opacity-60 flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isSearching ? 'Searching...' : 'Find Elder'}</span>
                </button>
              </div>
            </form>

            {searchError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Found Elder Profile Card */}
            {searchedPatient && (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      👴
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {searchedPatient.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        +91 {searchedPatient.phone} · Age: {searchedPatient.age || 74}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Verified Profile
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Add Note / Relation
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. Hi ${searchedPatient.name.split(' ')[0]}, I am your ${currentUser?.role === 'CHILD' ? 'son/daughter' : currentUser?.role === 'DOCTOR' ? 'physician' : 'caretaker'}`}
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendRequest}
                  disabled={isSending}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>{isSending ? 'Sending Request...' : `Send Care Circle Request to ${searchedPatient.name.split(' ')[0]}`}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
