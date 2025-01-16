import { UserRepository } from "../../../domain/Users/repositories/UserRepository";

export class GetUserById {
  constructor(private userRepository: UserRepository) {}

  async execute(id: number) {
    return this.userRepository.getById(id);
  }
}
