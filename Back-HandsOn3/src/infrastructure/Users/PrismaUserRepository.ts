import type { IUserRepository } from '../../domain/Users/repositories/UserRepository';
import { User } from '../../domain/Users/entities/User';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PrismaUserRepository implements IUserRepository {
  async delete(id: number): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user
      ? new User(user.id, user.name, user.email, user.password)
      : null;
  }

  async create(user: User): Promise<User> {
    try {
      const existingUser = await this.getByEmail(user.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      const createdUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: user.password
        }
      });

      return new User(
        createdUser.id,
        createdUser.name,
        createdUser.email,
        createdUser.password
      );
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create user');
    }
  }

  async getById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user
      ? new User(user.id, user.name, user.email, user.password, user.role)
      : null;
  }

  async getAll(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users.map(
      (user) => new User(user.id, user.name, user.email, user.password)
    );
  }

  async update(id: number, user: User): Promise<User | null> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          name: user.name,
          email: user.email,
          ...(user.password && { password: user.password })
        }
      });

      return new User(
        updatedUser.id,
        updatedUser.name,
        updatedUser.email,
        updatedUser.password
      );
    } catch {
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return null;
    }

    return new User(user.id, user.name, user.email, user.password);
  }
}
