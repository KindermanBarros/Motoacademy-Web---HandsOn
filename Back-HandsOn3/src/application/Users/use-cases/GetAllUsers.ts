import type { UserRepository } from '../../../domain/Users/repositories/UserRepository';

export class GetAllUsers {
  constructor(private userRepository: UserRepository) {}

  async execute() {
    return this.userRepository.getAll();
  }
}
