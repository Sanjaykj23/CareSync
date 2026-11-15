'use client';

import React from 'react';

interface DigitalClockProps {
  value: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'giant';
  color?: 'dark' | 'red' | 'blue' | 'green' | 'amber';
  suffix?: string;
  className?: string;
}

// Dot matrix LED display generator for numbers and colons
export default function DigitalClock({
  value,
  size = 'lg',
  color = 'dark',
  suffix,
  className = '',
}: DigitalClockProps) {
  const sizeClasses = {
    sm: 'text-2xl tracking-wider',
    md: 'text-4xl tracking-widest',
    lg: 'text-5xl font-bold tracking-widest',
    xl: 'text-6xl font-extrabold tracking-widest',
    giant: 'text-7xl font-black tracking-widest',
  };

  const colorClasses = {
    dark: 'text-slate-900',
    red: 'text-red-500',
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    amber: 'text-amber-500',
  };

  return (
    <div className={`inline-flex items-baseline font-mono select-none ${className}`}>
      <span
        className={`font-mono ${sizeClasses[size]} ${colorClasses[color]} leading-none`}
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          letterSpacing: '0.15em',
          textShadow: color === 'red' ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none',
        }}
      >
        {value}
      </span>
      {suffix && (
        <span className="ml-2 text-base font-sans font-medium text-slate-500">
          {suffix}
        </span>
      )}
    </div>
  );
}
