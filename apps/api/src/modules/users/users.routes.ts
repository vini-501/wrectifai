import { Router } from 'express';

export const usersRouter = Router();

usersRouter.get('/', (_req, res) => {
  res.json([{ id: 'u_1', name: 'Wrectifai User' }]);
});
