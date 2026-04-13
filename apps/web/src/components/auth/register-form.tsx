'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, UserRound, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_BASE_URL } from '@/lib/api';
import { cn } from '@/lib/utils';

type RoleOption = { code: 'user' | 'garage' | 'vendor'; label: string; description: string };

type RegisterFormProps = {
  title: string;
  subtitle: string;
  roleOptions: RoleOption[];
};

const icons = {
  user: UserRound,
  garage: Store,
  vendor: Wrench,
};

export function RegisterForm({ title, subtitle, roleOptions }: RegisterFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [roleCode, setRoleCode] = useState<RoleOption['code']>('user');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredOptions = useMemo(
    () => roleOptions.filter((role) => ['user', 'garage', 'vendor'].includes(role.code)),
    [roleOptions]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be 10 digits');
      return;
    }
    if (!accepted) {
      setError('Please accept terms to continue');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone,
          roleCode,
          fullName,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? 'Unable to send OTP');
      }
      router.push(
        `/auth/verify?mode=register&phone=${encodeURIComponent(phone)}&fullName=${encodeURIComponent(fullName)}&roleCode=${roleCode}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="font-display text-4xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-3 sm:grid-cols-3">
          {filteredOptions.map((role) => {
            const Icon = icons[role.code];
            const active = roleCode === role.code;
            return (
              <button
                key={role.code}
                type="button"
                onClick={() => setRoleCode(role.code)}
                className={cn(
                  'rounded-lg p-4 text-left transition-colors',
                  active
                    ? 'bg-accent ring-2 ring-primary'
                    : 'surface-low ghost-border hover:bg-accent'
                )}
              >
                <Icon className="mb-2 h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground">{role.label}</p>
                <p className="text-xs text-muted-foreground">{role.description}</p>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
          />
        </div>

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

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--primary))]"
          />
          I agree to the Terms and Privacy Policy
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button className="h-12 w-full text-base" type="submit" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Create Account'}
        </Button>
      </form>
    </div>
  );
}

