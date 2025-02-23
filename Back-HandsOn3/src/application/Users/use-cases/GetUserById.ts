import type { IUserRepository } from '../../../domain/Users/repositories/UserRepository';

export class GetUserById {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: number) {
    return this.userRepository.getById(id);
  }
}
