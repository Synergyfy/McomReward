'use client';

import React from 'react';
import SettingsContent from '@/components/customer/settings/SettingsContent';

export default function AdminSettingsPage() {
  return <SettingsContent isAdmin={true} />;
}
