'use client';

import React from 'react';
import RoleSwitcher from '@/components/RoleSwitcher';
import DoctorPortal from '@/components/DoctorPortal';

export default function DoctorDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F3F5F9]">
      <RoleSwitcher onOpenIotModal={() => {}} />
      <DoctorPortal />
    </div>
  );
}
