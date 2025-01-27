import type { UserRepository } from '../../../domain/Users/repositories/UserRepository';

export class DeleteUser {
  constructor(private userRepository: UserRepository) {}

  async execute(id: number) {
    return this.userRepository.delete(id);
  }
}
