import type { PrismaUserRepository } from '../../../infrastructure/Users/PrismaUserRepository';
import type { User } from '../../../domain/Users/entities/User';

export class LoginUser {
  constructor(private readonly userRepository: PrismaUserRepository) {}

  async execute(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    if (user.password !== password) {
      return null;
    }

    return user;
  }
}
