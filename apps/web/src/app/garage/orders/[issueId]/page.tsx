import { GarageDashboardShell } from '@/components/garage/garage-dashboard-shell';
import { IssueDetailsClient } from './issue-details-client';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{
    issueId: string;
  }>;
};

export default async function GarageOrderIssuePage({ params }: PageProps) {
  const { issueId } = await params;

  return (
    <GarageDashboardShell activeItem="orders">
      <IssueDetailsClient issueId={issueId} />
    </GarageDashboardShell>
  );
}

