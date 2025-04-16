import type { Request, Response, NextFunction } from 'express';

export function requireRole(role: 'ADMIN' | 'USER') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (userRole !== role) {
      res.status(403).json({ error: 'Access denied. Insufficient role.' });
      return;
    }

    next();
  };
}
