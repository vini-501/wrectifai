'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_BASE_URL } from '@/lib/api';

type LoginFormProps = {
  title: string;
  subtitle: string;
};

export function LoginForm({ title, subtitle }: LoginFormProps) {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be 10 digits');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? 'Unable to send OTP');
      }
      router.push(`/auth/verify?mode=login&phone=${encodeURIComponent(phone)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="font-display text-4xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button className="h-12 w-full text-base" type="submit" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      </form>
    </div>
  );
}

