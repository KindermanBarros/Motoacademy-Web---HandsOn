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
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authorization.split(" ")[1];

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

    const { password: _, ...loggedUser } = user;

    req.user = loggedUser;

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};

declare global {
  namespace Express {
    interface Request {
      userId: number;
      user: Partial<User>;
    }
  }
}
