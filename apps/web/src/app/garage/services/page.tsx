import { GarageDashboardShell } from '@/components/garage/garage-dashboard-shell';
import { ServicesClient } from './services-client';

export const dynamic = 'force-dynamic';

export default function GarageServicesPage() {
  return (
    <GarageDashboardShell activeItem="services">
      <ServicesClient />
    </GarageDashboardShell>
  );
}
