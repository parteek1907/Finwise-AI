"use client";

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

export default function ProfilePage() {
  return (
    <AppLayout>
      <SettingsLayout />
    </AppLayout>
  );
}
