import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoutButton } from '@/components/auth/logout-button';
import { SessionGuard } from '@/components/auth/session-guard';

export const dynamic = 'force-dynamic';

export default function UserDashboardPage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <SessionGuard requiredRole="user" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">User Dashboard</h1>
        <LogoutButton />
      </div>
      <Card className="surface-lowest shadow-ambient">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Only `user` role can access this path.</p>
        </CardContent>
      </Card>
    </main>
  );
}
