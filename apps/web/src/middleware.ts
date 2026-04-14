import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/vendor/register',
  '/auth/garage/register',
  '/auth/verify',
];
const rolePrefixes = ['/user', '/garage', '/vendor', '/admin'] as const;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

function withNoStore(res: NextResponse) {
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');
  return res;
}

async function getSessionRole(req: NextRequest) {
  const accessToken = req.cookies.get('wrect_at')?.value;
  if (!accessToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        cookie: req.headers.get('cookie') ?? '',
      },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      user?: { roleCode?: 'user' | 'garage' | 'vendor' | 'admin' };
    };
    return data.user?.roleCode ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const role = await getSessionRole(req);
  const isAuthed = Boolean(role);
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const rolePath = rolePrefixes.find((prefix) => pathname.startsWith(prefix));

  if (!isAuthed && rolePath) {
    return withNoStore(NextResponse.redirect(new URL('/auth/login', req.url)));
  }

  if (!isAuthed && pathname === '/') {
    return withNoStore(NextResponse.redirect(new URL('/auth/login', req.url)));
  }

  if (isAuthed && isPublic) {
    return withNoStore(NextResponse.redirect(new URL(`/${role}/dashboard`, req.url)));
  }

  if (isAuthed && rolePath) {
    const requiredRole = rolePath.slice(1);
    if (requiredRole !== role) {
      return withNoStore(NextResponse.redirect(new URL(`/${role}/dashboard`, req.url)));
    }
  }

  if (isPublic || rolePath || pathname === '/') {
    return withNoStore(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
