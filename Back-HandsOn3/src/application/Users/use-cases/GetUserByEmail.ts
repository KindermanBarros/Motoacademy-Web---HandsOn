import type { IUserRepository } from '../../../domain/Users/repositories/UserRepository';

export class GetUserByEmail {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string) {
    return this.userRepository.getByEmail(email);
  }
}
