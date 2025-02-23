import type { User } from '../../../domain/Users/entities/User';

export class UserDTO {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly email: string
  ) {}

  static fromEntity(user: User): UserDTO {
    return new UserDTO(user.id, user.name, user.email);
  }
}
