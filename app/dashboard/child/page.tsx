'use client';

import React from 'react';
import RoleSwitcher from '@/components/RoleSwitcher';
import ChildPortal from '@/components/ChildPortal';

export default function ChildDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F3F5F9]">
      <RoleSwitcher onOpenIotModal={() => {}} />
      <ChildPortal />
    </div>
  );
}
