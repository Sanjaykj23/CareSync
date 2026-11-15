'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { UserCheck, Check, X, Shield, Clock, Stethoscope, HeartHandshake } from 'lucide-react';

export default function LinkingRequestsTray() {
  const { linkingRequests, respondToLinkingRequest, speak } = useApp();

  const pendingRequests = linkingRequests.filter(r => r.status === 'PENDING');
  const acceptedRequests = linkingRequests.filter(r => r.status === 'ACCEPTED');

  return (
    <div className="bg-white rounded-4xl p-6 sm:p-7 shadow-soft border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Care Circle Access Requests
            </h3>
            <p className="text-xs text-slate-500">
              You decide who can view your healthcare data and manage medications.
            </p>
          </div>
        </div>

        {pendingRequests.length > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold animate-pulse">
            {pendingRequests.length} Pending Approval
          </span>
        )}
      </div>

      {/* Pending Requests List */}
      {pendingRequests.length > 0 ? (
        <div className="space-y-3 mb-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Needs Your Permission
          </span>
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-3xl bg-amber-50/70 border-2 border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-200/80 text-amber-900 font-bold flex items-center justify-center text-sm shrink-0 mt-0.5">
                  {req.requester_role === 'DOCTOR' ? '🩺' : req.requester_role === 'CHILD' ? '👨‍👩‍👧' : '🧑‍⚕️'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {req.requester_name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase">
                      {req.requester_role}
                    </span>
                  </div>
                  {req.requester_specialty && (
                    <span className="text-xs font-semibold text-blue-700 block mt-0.5">
                      {req.requester_specialty}
                    </span>
                  )}
                  <p className="text-xs text-slate-600 mt-1 italic">
                    &quot;{req.message}&quot;
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">
                    Phone: +91 {req.requester_phone}
                  </span>
                </div>
              </div>

              {/* Accept & Reject Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-200/60">
                <button
                  onClick={() => respondToLinkingRequest(req.id, 'ACCEPTED')}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span>Accept Access</span>
                </button>

                <button
                  onClick={() => respondToLinkingRequest(req.id, 'REJECTED')}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                  <span>Decline</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500 mb-4">
          ✓ All connection requests have been reviewed. No pending access requests.
        </div>
      )}

      {/* Active Connected Circle Members */}
      <div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
          Active Connected Members ({acceptedRequests.length})
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {acceptedRequests.map(req => (
            <div key={req.id} className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  ✓
                </span>
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    {req.requester_name}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {req.requester_role} · Access Granted
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                Linked
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
