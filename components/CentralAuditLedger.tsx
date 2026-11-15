'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { CareRole } from '@/lib/types';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  FileCheck2, 
  Lock 
} from 'lucide-react';

export default function CentralAuditLedger() {
  const { auditLogs } = useApp();
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesRole = selectedRole === 'ALL' || log.actor_role === selectedRole;
    const matchesSearch = 
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ELDER':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">👴 ELDER</span>;
      case 'CHILD':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">👨‍👩‍👧 CHILD</span>;
      case 'CARETAKER':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">🧑‍⚕️ CARETAKER</span>;
      case 'DOCTOR':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">🩺 DOCTOR</span>;
      case 'IOT_DEVICE':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">🤖 IOT_BOX</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">⚙️ SYSTEM</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Immutability Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Append-Only Trigger Active
            </span>
            <span className="text-xs text-slate-400">· PostgreSQL trg_immutable_audit_logs</span>
          </div>
          <h2 className="text-2xl font-black mt-1">
            Centralized Activity & Audit Ledger
          </h2>
          <p className="text-sm text-slate-400">
            Immutable, cross-role audit trail logging every medication intake, prescription change, and IoT sensor event.
          </p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-2.5 text-right">
          <span className="text-[11px] text-slate-400 block font-medium">Logged Entries</span>
          <span className="font-mono font-bold text-white text-lg">{auditLogs.length} Events</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {['ALL', 'ELDER', 'CHILD', 'CARETAKER', 'DOCTOR', 'IOT_DEVICE'].map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedRole === role
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search actions or actors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No audit records matching your current filter.
            </div>
          ) : (
            filteredLogs.map(log => {
              const isExpanded = expandedId === log.id;
              const hasDiff = log.previous_value || log.new_value;

              return (
                <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold">
                        {log.actor_role === 'IOT_DEVICE' ? <Cpu className="w-4 h-4 text-cyan-600" /> : <FileCheck2 className="w-4 h-4 text-slate-600" />}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {getRoleBadge(log.actor_role)}
                          <span className="font-extrabold text-slate-900 text-sm">
                            {log.actor_name}
                          </span>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {log.action_type}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          {log.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(log.created_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>

                      {hasDiff && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-all"
                          title="Inspect JSON Payload"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Diff Inspector */}
                  {isExpanded && hasDiff && (
                    <div className="mt-3 p-3 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-rose-400 block uppercase font-bold mb-1">Previous State</span>
                        <pre className="bg-slate-950 p-2 rounded-xl overflow-x-auto text-[11px]">
                          {log.previous_value ? JSON.stringify(log.previous_value, null, 2) : 'null'}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 block uppercase font-bold mb-1">New State</span>
                        <pre className="bg-slate-950 p-2 rounded-xl overflow-x-auto text-[11px]">
                          {log.new_value ? JSON.stringify(log.new_value, null, 2) : 'null'}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
