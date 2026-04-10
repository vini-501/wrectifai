import { Router } from 'express';

export const authRouter = Router();

authRouter.get('/status', (_req, res) => {
  res.json({ feature: 'auth', status: 'ready' });
});
