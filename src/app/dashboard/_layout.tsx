import { Slot } from 'expo-router';

import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function DashboardLayout() {
  return (
    <DashboardShell>
      <Slot />
    </DashboardShell>
  );
}