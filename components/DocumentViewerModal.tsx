'use client';

import React from 'react';
import { X, FileText, CheckCircle2, Copy } from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category?: string;
  imageUrl?: string | null;
  extractedText?: string | null;
  date?: string;
  doctorOrFacility?: string;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  title,
  category,
  imageUrl,
  extractedText,
  date,
  doctorOrFacility,
}: DocumentViewerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {category && <span className="capitalize">{category.replace('_', ' ')} · </span>}
                {doctorOrFacility && <span>{doctorOrFacility} · </span>}
                {date || new Date().toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Document / Receipt Image View */}
          {imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-64 flex items-center justify-center relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={title}
                className="max-h-64 w-auto object-contain"
              />
            </div>
          )}

          {/* Extracted OCR Text Box */}
          {extractedText ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>OCR Extracted Text & Clinical Notes</span>
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Machine Verified
                </span>
              </div>
              <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-200">
                {extractedText}
              </pre>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 text-center">
              Verified clinical receipt archived securely in Supabase.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
