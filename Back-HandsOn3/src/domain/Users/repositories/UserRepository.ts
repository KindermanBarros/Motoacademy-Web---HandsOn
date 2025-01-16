import { User } from "../entities/User";

export interface UserRepository {
  getById(id: number): Promise<User | null>;
  create(user: User): Promise<User>;
}
