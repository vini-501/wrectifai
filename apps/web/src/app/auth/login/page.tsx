import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { getAuthRuntimeContent } from '@/lib/api';

export default async function LoginPage() {
  const runtime = await getAuthRuntimeContent();

  return (
    <AuthShell
      appName={runtime.appIdentity.name ?? 'WrectifAI'}
      heroKicker={runtime.copy['auth.hero.kicker'] ?? 'AUTOMOTIVE INTELLIGENCE'}
      heroTitle={
        runtime.copy['auth.hero.title'] ?? 'Experience Surgical Precision in Car Care.'
      }
      heroBody={
        runtime.copy['auth.hero.body'] ??
        'Join the elite ecosystem of automotive specialists and enthusiasts.'
      }
      rightPane={
        <div>
          <p className="mb-6 text-right text-sm text-muted-foreground">
            Need an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
          <LoginForm
            title={runtime.copy['auth.login.title'] ?? 'Welcome Back'}
            subtitle={
              runtime.copy['auth.login.subtitle'] ??
              'Login with your 10-digit phone number.'
            }
          />
        </div>
      }
    />
  );
}

