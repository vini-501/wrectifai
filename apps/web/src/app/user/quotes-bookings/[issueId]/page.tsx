import { getQuotesBookingsContent, getUserSidebarContent } from '@/lib/api';
import { IssueQuotesClient } from './issue-quotes-client';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{
    issueId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { issueId } = await params;
  const [sidebar, content] = await Promise.all([
    getUserSidebarContent(),
    getQuotesBookingsContent(),
  ]);

  return <IssueQuotesClient sidebar={sidebar} content={content} issueId={issueId} />;
}
