import type { PrismaUserRepository } from '../../../infrastructure/Users/PrismaUserRepository';
import type { User } from '../../../domain/Users/entities/User';

export class CreateUser {
  constructor(private readonly userRepository: PrismaUserRepository) {}

  async execute(user: User): Promise<User> {
    if (!user.password) {
      throw new Error('Password is required');
    }
    return this.userRepository.create(user);
  }
}
