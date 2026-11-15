'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Delete, KeyRound, Sparkles } from 'lucide-react';

interface ElderPinPadProps {
  onSuccess?: () => void;
}

export default function ElderPinPad({ onSuccess }: ElderPinPadProps) {
  const { loginWithPasscode, speak } = useApp();
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      speak(digit);

      if (nextPin.length === 4) {
        setTimeout(() => {
          verifyPin(nextPin);
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(prev => prev.slice(0, -1));
      speak('Delete');
      setErrorMsg(null);
    }
  };

  const verifyPin = (submittedPin: string) => {
    const success = loginWithPasscode('ELDER', submittedPin);
    if (success) {
      setPin('');
      setErrorMsg(null);
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const fillDemoPin = () => {
    setPin('1234');
    speak('One, two, three, four. Demo PIN loaded.');
    setTimeout(() => {
      loginWithPasscode('ELDER', '1234');
      if (onSuccess) onSuccess();
    }, 400);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-4xl p-6 sm:p-8 shadow-float border border-slate-100 flex flex-col items-center">
      {/* Icon & Heading */}
      <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-inner">
        <KeyRound className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">
        Elder PIN Entry
      </h2>
      <p className="text-sm text-slate-500 text-center mt-1 mb-6">
        Sundaram Iyer · 4-Digit Vocal Passcode
      </p>

      {/* 4 PIN Dots */}
      <div className="flex items-center gap-4 mb-6">
        {[0, 1, 2, 3].map((idx) => {
          const isFilled = pin.length > idx;
          return (
            <div
              key={idx}
              className={`w-5 h-5 rounded-full transition-all duration-200 border-2 ${
                isFilled
                  ? 'bg-blue-600 border-blue-600 scale-125 shadow-sm shadow-blue-500/40'
                  : 'bg-slate-100 border-slate-300'
              }`}
            />
          );
        })}
      </div>

      {/* Error message if any */}
      {errorMsg && (
        <div className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 px-4 py-1.5 rounded-full mb-4 animate-shake">
          {errorMsg}
        </div>
      )}

      {/* Giant Tactile Keypad */}
      <div className="grid grid-cols-3 gap-3.5 w-full">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleDigit(num)}
            className="h-16 rounded-2xl bg-slate-50 hover:bg-blue-50 active:bg-blue-600 active:text-white border border-slate-200/80 text-2xl font-bold text-slate-800 transition-all flex items-center justify-center shadow-sm select-none active:scale-95"
          >
            {num}
          </button>
        ))}

        {/* Clear Button */}
        <button
          onClick={() => {
            setPin('');
            speak('Cleared');
            setErrorMsg(null);
          }}
          className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200/80 text-sm font-semibold text-slate-600 transition-all flex items-center justify-center shadow-sm select-none active:scale-95"
        >
          Clear
        </button>

        {/* Digit 0 */}
        <button
          onClick={() => handleDigit('0')}
          className="h-16 rounded-2xl bg-slate-50 hover:bg-blue-50 active:bg-blue-600 active:text-white border border-slate-200/80 text-2xl font-bold text-slate-800 transition-all flex items-center justify-center shadow-sm select-none active:scale-95"
        >
          0
        </button>

        {/* Backspace Button */}
        <button
          onClick={handleBackspace}
          className="h-16 rounded-2xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100 border border-slate-200/80 text-slate-700 transition-all flex items-center justify-center shadow-sm select-none active:scale-95"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      {/* Judge Quick Auto-fill button */}
      <button
        onClick={fillDemoPin}
        className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100 px-4 py-2 rounded-full border border-blue-200 transition-all"
      >
        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        Judge Demo: Auto-Fill PIN (1234)
      </button>
    </div>
  );
}
