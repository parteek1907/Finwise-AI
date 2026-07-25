"use client";

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

export default function SettingsPage() {
  return (
    <AppLayout>
      <SettingsLayout />
    </AppLayout>
  );
}
