import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { VerifyForm } from '@/components/auth/verify-form';
import { getAuthRuntimeContent } from '@/lib/api';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const runtime = await getAuthRuntimeContent();
  const params = await searchParams;
  const mode = (params.mode === 'register' ? 'register' : 'login') as
    | 'register'
    | 'login';
  const phone = typeof params.phone === 'string' ? params.phone : '';
  const roleCode = typeof params.roleCode === 'string' ? params.roleCode : undefined;
  const fullName = typeof params.fullName === 'string' ? params.fullName : undefined;

  return (
    <AuthShell
      appName={runtime.appIdentity.name ?? 'WrectifAI'}
      heroKicker={runtime.copy['auth.hero.kicker'] ?? 'AUTOMOTIVE INTELLIGENCE'}
      heroTitle={runtime.copy['auth.hero.title'] ?? 'Verify Your Secure Access.'}
      heroBody={runtime.copy['auth.hero.body'] ?? 'Security check for your account session.'}
      rightPane={
        <div>
          <p className="mb-6 text-right text-sm text-muted-foreground">
            Back to{' '}
            <Link href={mode === 'register' ? '/auth/register' : '/auth/login'} className="text-primary hover:underline">
              {mode === 'register' ? 'Register' : 'Login'}
            </Link>
          </p>
          <VerifyForm mode={mode} phone={phone} roleCode={roleCode} fullName={fullName} />
        </div>
      }
    />
  );
}

