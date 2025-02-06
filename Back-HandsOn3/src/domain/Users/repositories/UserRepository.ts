import type { User } from '../entities/User';

export interface UserRepository {
  getAll(): Promise<User[]>;
  getById(id: number): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: number, user: User): Promise<User | null>;
  delete(id: number): Promise<boolean>;
}
