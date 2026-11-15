'use client';

import React from 'react';
import RoleSwitcher from '@/components/RoleSwitcher';
import ElderPortal from '@/components/ElderPortal';

export default function ElderDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F3F5F9]">
      <RoleSwitcher onOpenIotModal={() => {}} />
      <ElderPortal />
    </div>
  );
}
