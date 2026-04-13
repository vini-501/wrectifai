import type { NextFunction, Request, Response } from 'express';
import { findSessionByAccessToken, type RoleCode } from './auth.service';

export type AuthUser = {
  userId: string;
  roleCode: RoleCode;
  fullName: string;
  phone: string;
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

  return {
    userId: session.user_id,
    roleCode: session.role_code,
    fullName: session.full_name,
    phone: session.phone,
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
    return next();
  };
}

