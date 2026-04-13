'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

type SessionGuardProps = {
  requiredRole: 'user' | 'garage' | 'vendor' | 'admin';
};

export function SessionGuard({ requiredRole }: SessionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    async function verifySession() {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          router.replace('/auth/login');
          return;
        }

        const data = (await response.json()) as {
          user?: { roleCode?: 'user' | 'garage' | 'vendor' | 'admin' };
        };
        const role = data.user?.roleCode;

        if (!role) {
          router.replace('/auth/login');
          return;
        }

        if (role !== requiredRole) {
          router.replace(`/${role}/dashboard`);
          return;
        }

        if (active) {
          router.refresh();
        }
      } catch {
        router.replace('/auth/login');
      }
    }

    verifySession();

    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        verifySession();
      }
    }

    window.addEventListener('pageshow', onPageShow);
    return () => {
      active = false;
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [pathname, requiredRole, router]);

  return null;
}
