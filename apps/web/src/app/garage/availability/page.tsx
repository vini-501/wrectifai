import { GarageDashboardShell } from '@/components/garage/garage-dashboard-shell';
import { AvailabilityClient } from './availability-client';

export const dynamic = 'force-dynamic';

export default function GarageAvailabilityPage() {
  return (
    <GarageDashboardShell activeItem="availability">
      <AvailabilityClient />
    </GarageDashboardShell>
  );
}
