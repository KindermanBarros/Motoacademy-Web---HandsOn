import type { IUserRepository } from '../../../domain/Users/repositories/UserRepository';

export class DeleteUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: number): Promise<boolean> {
    return this.userRepository.delete(id);
  }
}
