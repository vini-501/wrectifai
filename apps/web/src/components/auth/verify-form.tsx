'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_BASE_URL } from '@/lib/api';

type VerifyFormProps = {
  mode: 'login' | 'register';
  phone: string;
  roleCode?: string;
  fullName?: string;
};

export function VerifyForm({ mode, phone, roleCode, fullName }: VerifyFormProps) {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        mode === 'register' ? '/auth/register/verify' : '/auth/login/verify';
      const payload =
        mode === 'register'
          ? { phone, roleCode, fullName, otp }
          : { phone, otp };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? 'Unable to verify OTP');
      }
      router.push(data.redirectPath ?? '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="font-display text-4xl font-bold text-foreground">Verify OTP</h2>
      <p className="mt-2 text-muted-foreground">
        Please enter 6 digit OTP sent to {phone}.
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="otp">OTP</Label>
          <Input
            id="otp"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Please enter 6 digit OTP"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="h-12 w-full text-base" type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify and Continue'}
        </Button>
      </form>
    </div>
  );
}
