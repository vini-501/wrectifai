import { getAppIdentityConfig, getUserSidebarContent } from '@/lib/api';
import { DirectRequestClient } from './direct-request-client';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [sidebar, appIdentity] = await Promise.all([
    getUserSidebarContent(),
    getAppIdentityConfig(),
  ]);

  return <DirectRequestClient sidebar={sidebar} appLogoUrl={appIdentity.logoUrl} />;
}
