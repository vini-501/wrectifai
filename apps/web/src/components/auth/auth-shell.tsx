import type { ReactNode } from 'react';

type AuthShellProps = {
  appName: string;
  heroKicker: string;
  heroTitle: string;
  heroBody: string;
  rightPane: ReactNode;
};

export function AuthShell({
  appName,
  heroKicker,
  heroTitle,
  heroBody,
  rightPane,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex items-center justify-between">
          <p className="font-display text-4xl font-bold text-foreground">{appName}</p>
          <p className="text-sm text-muted-foreground">Phone + OTP authentication</p>
        </header>

        <section className="grid gap-0 overflow-hidden rounded-xl surface-low shadow-ambient lg:grid-cols-2">
          <aside className="relative min-h-[520px] overflow-hidden bg-sidebar p-12 text-sidebar-foreground">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(72,148,226,0.25),transparent_45%)]" />
            <div className="relative z-10">
              <p className="mb-6 inline-flex rounded-full bg-sidebar-accent px-4 py-1 text-xs tracking-[0.16em] text-sidebar-foreground">
                {heroKicker}
              </p>
              <h1 className="mb-6 text-5xl font-display font-extrabold leading-tight">
                {heroTitle}
              </h1>
              <p className="max-w-md text-xl text-blue-100/85">{heroBody}</p>
            </div>
          </aside>

          <div className="surface-lowest p-10">{rightPane}</div>
        </section>
      </div>
    </main>
  );
}

