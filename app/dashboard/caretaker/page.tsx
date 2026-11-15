'use client';

import React from 'react';
import RoleSwitcher from '@/components/RoleSwitcher';
import CaretakerPortal from '@/components/CaretakerPortal';

export default function CaretakerDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F3F5F9]">
      <RoleSwitcher onOpenIotModal={() => {}} />
      <CaretakerPortal />
    </div>
  );
}
