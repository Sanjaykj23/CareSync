'use client';

import React from 'react';
import RoleSwitcher from '@/components/RoleSwitcher';
import CentralAuditLedger from '@/components/CentralAuditLedger';

export default function AuditDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F3F5F9]">
      <RoleSwitcher onOpenIotModal={() => {}} />
      <CentralAuditLedger />
    </div>
  );
}
