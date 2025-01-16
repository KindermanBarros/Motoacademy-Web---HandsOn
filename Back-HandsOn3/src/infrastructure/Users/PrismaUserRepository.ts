import { UserRepository } from "../../domain/Users/repositories/UserRepository";
import { User } from "../../domain/Users/entities/User";
import prisma from "../prisma/client";

export class PrismaUserRepository implements UserRepository {
  async getById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return new User(user.id, user.name, user.email);
  }

  async create(user: User): Promise<User> {
    const createdUser = await prisma.user.create({ data: user });
    return new User(createdUser.id, createdUser.name, createdUser.email);
  }
}
