'use client';

import { ServiceIntakeFlow } from '@/components/service-intake/service-intake-flow';
import type { UserSidebarContent } from '@/lib/api';

type Props = {
  sidebar: UserSidebarContent;
  appLogoUrl?: string;
};

export function DirectRequestClient({ sidebar, appLogoUrl }: Props) {
  return <ServiceIntakeFlow mode="direct" sidebar={sidebar} appLogoUrl={appLogoUrl} />;
}
