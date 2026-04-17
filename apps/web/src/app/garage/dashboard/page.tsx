import { GarageDashboardShell } from '@/components/garage/garage-dashboard-shell';
import { DashboardClient } from './dashboard-client';

export const dynamic = 'force-dynamic';

export default function GarageDashboardPage() {
  return (
    <GarageDashboardShell activeItem="dashboard">
      <DashboardClient />
    </GarageDashboardShell>
  );
}
