import type { AuthUser } from '../modules/auth/auth.middleware';

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export {};

