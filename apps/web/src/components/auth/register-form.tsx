'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_BASE_URL } from '@/lib/api';

type RegisterFormProps = {
  roleCode: 'user' | 'garage' | 'vendor';
  registerPath: string;
  title: string;
  subtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  termsLabel: string;
  createAccountLabel: string;
  sendingOtpLabel: string;
  fullNameRequiredMessage: string;
  invalidPhoneMessage: string;
  termsRequiredMessage: string;
  sendOtpFailedMessage: string;
  unexpectedErrorMessage: string;
};

export function RegisterForm({
  roleCode,
  registerPath,
  title,
  subtitle,
  fullNameLabel,
  fullNamePlaceholder,
  phoneLabel,
  phonePlaceholder,
  termsLabel,
  createAccountLabel,
  sendingOtpLabel,
  fullNameRequiredMessage,
  invalidPhoneMessage,
  termsRequiredMessage,
  sendOtpFailedMessage,
  unexpectedErrorMessage,
}: RegisterFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; phone?: string; terms?: string }>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: { fullName?: string; phone?: string; terms?: string } = {};

    if (!fullName.trim()) {
      errors.fullName = fullNameRequiredMessage;
    }
    if (!/^\d{10}$/.test(phone)) {
      errors.phone = invalidPhoneMessage;
    }
    if (!accepted) {
      errors.terms = termsRequiredMessage;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
        throw new Error(data.message ?? sendOtpFailedMessage);
      }
      router.push(
        `/auth/verify?mode=register&phone=${encodeURIComponent(phone)}&fullName=${encodeURIComponent(fullName)}&roleCode=${roleCode}&registerPath=${encodeURIComponent(registerPath)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : unexpectedErrorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="font-display text-4xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="fullName">{fullNameLabel}</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={fullNamePlaceholder}
            className={fieldErrors.fullName ? 'border-destructive' : ''}
          />
          {fieldErrors.fullName && <p className="text-sm text-destructive">{fieldErrors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{phoneLabel}</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder={phonePlaceholder}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className={fieldErrors.phone ? 'border-destructive' : ''}
          />
          {fieldErrors.phone && <p className="text-sm text-destructive">{fieldErrors.phone}</p>}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            {termsLabel}
          </label>
          {fieldErrors.terms && <p className="text-sm text-destructive">{fieldErrors.terms}</p>}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button className="h-12 w-full text-base" type="submit" disabled={loading}>
          {loading ? sendingOtpLabel : createAccountLabel}
        </Button>
      </form>
    </div>
  );
}
