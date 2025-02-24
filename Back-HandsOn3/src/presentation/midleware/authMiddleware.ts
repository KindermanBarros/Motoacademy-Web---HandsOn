import type { Request, Response, NextFunction } from 'express';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userId = req.header('X-User-Id');

  if (!userId) {
    res
      .status(401)
      .json({ error: 'No user ID provided. Please include X-User-Id header' });
    return;
  }

  const parsedUserId = Number.parseInt(userId);
  if (Number.isNaN(parsedUserId)) {
    res.status(400).json({ error: 'Invalid user ID format' });
    return;
  }

  req.userId = parsedUserId;
  next();
};

declare global {
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}