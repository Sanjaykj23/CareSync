'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Search, HeartHandshake, CheckCircle, X, ShieldAlert, User, ArrowRight } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setSearchedPatient(null);
    setIsSearching(true);

    const clean = searchPhone.replace(/\D/g, '');
    if (clean.length < 10) {
      setSearchError('Please enter a full 10-digit phone number.');
      setIsSearching(false);
      return;
    }

    setTimeout(() => {
      // Live search against active patient
      if (clean === patient.phone || clean.endsWith('23456')) {
        setSearchedPatient(patient);
        speak(`Found patient ${patient.name}`);
      } else {
        setSearchError(`No registered elder found with phone ending in ${clean.slice(-4)}. Verify the phone number.`);
      }
      setIsSearching(false);
    }, 400);
  };

  const handleSendRequest = () => {
    if (!searchedPatient) return;
    const msg = customMessage || `${currentUser?.name} (${currentUser?.role}) is requesting authorization to join your Care Circle.`;
    sendLinkingRequest(searchedPatient.phone, msg);
    setRequestSent(true);
    setTimeout(() => {
      onClose();
      setRequestSent(false);
      setSearchedPatient(null);
      setSearchPhone('');
    }, 1500);
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
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <h4 className="font-bold text-emerald-950 text-sm">Linking Request Dispatched</h4>
            <p className="text-xs text-emerald-700">
              Elder {searchedPatient?.name} has received your request. Once they accept, their dashboard and records will sync with your portal.
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
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="e.g. 9840123456"
                    value={searchPhone}
                    onChange={e => setSearchPhone(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono font-bold outline-none focus:border-blue-600 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isSearching ? 'Searching...' : 'Search'}</span>
                </button>
              </div>
            </form>

            {searchError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {searchError}
              </div>
            )}

            {/* Found Patient Result */}
            {searchedPatient && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-base flex items-center justify-center">
                      👴
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {searchedPatient.name}
                      </h4>
                      <p className="text-xs text-slate-600">
                        Age: {searchedPatient.age} Yrs · Phone: +91 {searchedPatient.phone}
                      </p>
                      <span className="text-[10px] font-mono text-blue-700 font-bold">
                        ABHA: {searchedPatient.abha_id}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Verified Elder
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Personalized Message for the Senior
                  </label>
                  <textarea
                    rows={2}
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                    placeholder={`Hi ${searchedPatient.name.split(' ')[0]}, ${currentUser?.name} here requesting to link with your health circle.`}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendRequest}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Send Care Circle Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
