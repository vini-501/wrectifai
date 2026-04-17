import { GarageDashboardShell } from '@/components/garage/garage-dashboard-shell';
import { BookingsClient } from './bookings-client';

export const dynamic = 'force-dynamic';

export default function GarageBookingsPage() {
  return (
    <GarageDashboardShell activeItem="bookings">
      <BookingsClient />
    </GarageDashboardShell>
  );
}
