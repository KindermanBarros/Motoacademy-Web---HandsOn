import type { UserRepository } from '../../domain/Users/repositories/UserRepository';
import { User } from '../../domain/Users/entities/User';
import prisma from '../prisma/client';

export class PrismaUserRepository implements UserRepository {
  async getAll(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users.map(
      (user: { id: number; name: string; email: string }) =>
        new User(user.id, user.name, user.email)
    );
  }

  async getById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return new User(user.id, user.name, user.email);
  }

  async create(user: User): Promise<User> {
    try {
      const existingEmail = await prisma.user.findUnique({
        where: { email: user.email }
      });

      if (existingEmail) {
        throw new Error('Email already exists');
      }

      const createdUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email
        }
      });

      return new User(createdUser.id, createdUser.name, createdUser.email);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create user');
    }
  }

  async update(id: number, user: User): Promise<User | null> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          name: user.name,
          email: user.email
        }
      });
      return new User(updatedUser.id, updatedUser.name, updatedUser.email);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return false;

      await prisma.user.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
