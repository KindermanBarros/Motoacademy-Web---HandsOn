import type { IUserRepository } from '../../../domain/Users/repositories/UserRepository';

export class GetAllUsers {
  constructor(private userRepository: IUserRepository) {}

  async execute() {
    return this.userRepository.getAll();
  }
}
