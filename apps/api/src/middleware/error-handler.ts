import type { NextFunction, Request, Response } from 'express';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);
  if (err instanceof Error) {
    if (
      err.message.includes('required') ||
      err.message.includes('Invalid') ||
      err.message.includes('mismatch') ||
      err.message.includes('must be')
    ) {
      return res.status(400).json({ message: err.message });
    }
    if (
      err.message.includes('Unauthorized') ||
      err.message.includes('expired') ||
      err.message.includes('not found')
    ) {
      return res.status(401).json({ message: err.message });
    }
    if (err.message.includes('exists') || err.message.includes('configured')) {
      return res.status(409).json({ message: err.message });
    }
    return res.status(500).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
}
