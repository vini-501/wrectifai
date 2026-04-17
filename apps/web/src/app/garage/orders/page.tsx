import { GarageDashboardShell } from '@/components/garage/garage-dashboard-shell';
import { OrdersClient } from './orders-client';

export const dynamic = 'force-dynamic';

export default function GarageOrdersPage() {
  return (
    <GarageDashboardShell activeItem="orders">
      <OrdersClient />
    </GarageDashboardShell>
  );
}
