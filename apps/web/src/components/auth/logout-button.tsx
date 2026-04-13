'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api';

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
    } finally {
      router.replace('/auth/login');
      router.refresh();
    }
  }

  return (
    <Button variant="secondary" onClick={logout}>
      Logout
    </Button>
  );
}
