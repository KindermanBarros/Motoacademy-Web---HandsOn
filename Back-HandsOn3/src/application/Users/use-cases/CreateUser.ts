import type { UserRepository } from '../../../domain/Users/repositories/UserRepository';
import type { User } from '../../../domain/Users/entities/User';

export class CreateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(user: User) {
    return this.userRepository.create(user);
  }
}
