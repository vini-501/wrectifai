import express from 'express';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/error-handler';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/api', apiRouter);
  app.use(errorHandler);

  return app;
}
