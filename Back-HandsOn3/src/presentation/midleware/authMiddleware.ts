import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaUserRepository } from "../../infrastructure/Users/PrismaUserRepository";
import { User } from "@prisma/client";

type JwtPayload = {
  id: number;
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401).json({ error: "Token not provided" });
    return;
  }

  const token = authorization.replace("Bearer", "").trim();

  try {
    const { id } = jwt.verify(
      token,
      process.env.JWT_SECRET ?? ""
    ) as JwtPayload;

    const userRepository = new PrismaUserRepository();
    const user = await userRepository.getById(id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!user.role) {
      res.status(403).json({ message: "User role not defined" });
      return;
    }
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    req.userId = user.id;

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

declare global {
  namespace Express {
    interface Request {
      userId: number;
      user: {
        id: number;
        name: string;
        email: string;
        role: "ADMIN" | "USER";
      };
    }
  }
}
