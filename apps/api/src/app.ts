import express from 'express';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/error-handler';
import { getEnv } from './config/env';
import { ensureDbBootstrap } from './db/bootstrap';

export function createApp() {
  const app = express();
  const { webOrigin } = getEnv();

  const bootstrap = ensureDbBootstrap();

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', webOrigin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('Referrer-Policy', 'no-referrer');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  });
  app.use(express.json());
  app.use(async (_req, _res, next) => {
    try {
      await bootstrap;
      next();
    } catch (error) {
      next(error);
    }
  });
  app.use('/api', apiRouter);
  app.use(errorHandler);

  return app;
}
