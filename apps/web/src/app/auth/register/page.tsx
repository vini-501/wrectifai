import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';
import { getAuthRuntimeContent } from '@/lib/api';

export default async function RegisterPage() {
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
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
          <RegisterForm
            title={runtime.copy['auth.register.title'] ?? 'Create Account'}
            subtitle={
              runtime.copy['auth.register.subtitle'] ??
              'Start your journey with WrectifAI precision today.'
            }
            roleOptions={runtime.roleOptions}
          />
        </div>
      }
    />
  );
}

