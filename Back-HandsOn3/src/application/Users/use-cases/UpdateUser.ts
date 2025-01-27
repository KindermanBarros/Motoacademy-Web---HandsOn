import type { UserRepository } from '../../../domain/Users/repositories/UserRepository';
import type { User } from '../../../domain/Users/entities/User';

export class UpdateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(id: number, user: User) {
    return this.userRepository.update(id, user);
  }
}
