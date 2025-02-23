import type { PrismaUserRepository } from '../../../infrastructure/Users/PrismaUserRepository';
import { compare } from 'bcrypt';
import type { User } from '../../../domain/Users/entities/User';

export class LoginUser {
  constructor(private readonly userRepository: PrismaUserRepository) {}

  async execute(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return null;
    }

    return user;
  }
}
