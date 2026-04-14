import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { uiContentRouter } from '../modules/ui-content/ui-content.routes';
import { usersRouter } from '../modules/users/users.routes';
import { getHealthStatus } from '../services/health.service';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json(getHealthStatus());
});

apiRouter.use('/ui-content', uiContentRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
