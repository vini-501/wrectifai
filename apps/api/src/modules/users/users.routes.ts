import { Router } from 'express';
import { requireAuth, requireRole } from '../auth/auth.middleware';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.authUser });
});

usersRouter.get('/user/dashboard', requireAuth, requireRole('user'), (_req, res) => {
  res.json({ role: 'user', message: 'User dashboard data' });
});

usersRouter.get('/garage/dashboard', requireAuth, requireRole('garage'), (_req, res) => {
  res.json({ role: 'garage', message: 'Garage dashboard data' });
});

usersRouter.get('/vendor/dashboard', requireAuth, requireRole('vendor'), (_req, res) => {
  res.json({ role: 'vendor', message: 'Vendor dashboard data' });
});

usersRouter.get('/admin/dashboard', requireAuth, requireRole('admin'), (_req, res) => {
  res.json({ role: 'admin', message: 'Admin dashboard data' });
});
