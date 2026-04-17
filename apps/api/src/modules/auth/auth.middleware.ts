import type { NextFunction, Request, Response } from 'express';
import { findSessionByAccessToken, type RoleCode } from './auth.service';
import { query } from '../../db/postgres';

export type AuthUser = {
  userId: string;
  roleCode: RoleCode;
  fullName: string;
  phone: string;
  garageApproved?: boolean;
  garageVerificationStatus?: string | null;
};

function parseCookieValue(req: Request, key: string) {
  const source = req.headers.cookie ?? '';
  const parts = source.split(';').map((v) => v.trim());
  const found = parts.find((v) => v.startsWith(`${key}=`));
  if (!found) return null;
  return decodeURIComponent(found.slice(key.length + 1));
}

async function resolveAuthUser(req: Request) {
  const authHeader = req.headers.authorization;
  const bearer = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;
  const accessToken = bearer ?? parseCookieValue(req, 'wrect_at');
  if (!accessToken) return null;

  const session = await findSessionByAccessToken(accessToken);
  if (!session) return null;

  let garageApproved: boolean | undefined = undefined;
  let garageVerificationStatus: string | null | undefined = undefined;
  if (session.role_code === 'garage') {
    const garage = await query<{ is_approved: boolean; verification_status: string | null }>(
      `
        SELECT is_approved, verification_status
        FROM garages
        WHERE owner_user_id = $1::uuid
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [session.user_id]
    );
    garageApproved = garage.rows[0]?.is_approved === true;
    garageVerificationStatus = garage.rows[0]?.verification_status ?? null;
  }

  return {
    userId: session.user_id,
    roleCode: session.role_code,
    fullName: session.full_name,
    phone: session.phone,
    garageApproved,
    garageVerificationStatus,
  } satisfies AuthUser;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await resolveAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.authUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireRole(roleCode: RoleCode) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.authUser;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (user.roleCode !== roleCode) {
      return res.status(403).json({ message: 'Forbidden for this role' });
    }
    if (roleCode === 'garage') {
      const isProfileRoute = req.path === '/profile' || req.path.startsWith('/profile/');
      const isDashboardRoute = req.path === '/dashboard' || req.path.startsWith('/dashboard/');
      if (!isProfileRoute && !isDashboardRoute && user.garageApproved === false) {
        return res.status(403).json({
          message: 'Your garage account is pending approval. Please wait for admin verification before accessing this feature.',
          code: 'GARAGE_APPROVAL_PENDING',
        });
      }
    }
    return next();
  };
}
