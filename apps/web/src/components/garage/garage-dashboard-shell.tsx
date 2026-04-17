import type React from 'react';
import { SessionGuard } from '@/components/auth/session-guard';
import { GarageSidebar, GarageSidebarMobile } from './garage-sidebar';
import type { GarageSidebarItemKey } from './garage-sidebar';

type GarageDashboardShellProps = {
  activeItem: GarageSidebarItemKey;
  children: React.ReactNode;
};

export function GarageDashboardShell({ activeItem, children }: GarageDashboardShellProps) {
  return (
    <div className="flex h-screen bg-background">
      <SessionGuard requiredRole="garage" />
      <GarageSidebarMobile activeItem={activeItem} />
      <div className="hidden lg:block">
        <GarageSidebar activeItem={activeItem} />
      </div>

      <main className="flex-1 overflow-y-auto bg-[#f1f3f8]">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
