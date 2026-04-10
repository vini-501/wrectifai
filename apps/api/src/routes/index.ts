import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { usersRouter } from '../modules/users/users.routes';
import { getHealthStatus } from '../services/health.service';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json(getHealthStatus());
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
