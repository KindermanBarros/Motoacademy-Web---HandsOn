import type { UserRepository } from '../../../domain/Users/repositories/UserRepository';

export class DeleteUser {
  constructor(private userRepository: UserRepository) {}

  async execute(id: number): Promise<boolean> {
    return this.userRepository.delete(id);
  }
}
