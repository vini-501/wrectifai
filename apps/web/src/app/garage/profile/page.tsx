import { GarageDashboardShell } from '@/components/garage/garage-dashboard-shell';
import { ProfileClient } from './profile-client';

export const dynamic = 'force-dynamic';

export default function GarageProfilePage() {
  return (
    <GarageDashboardShell activeItem="profile">
      <ProfileClient />
    </GarageDashboardShell>
  );
}
