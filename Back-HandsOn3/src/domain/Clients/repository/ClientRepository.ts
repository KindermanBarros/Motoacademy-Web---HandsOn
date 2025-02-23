import type { Client } from '../entities/Client';

export interface IClientRepository {
  create(client: Client): Promise<Client>;
  getById(id: number): Promise<Client | null>;
  getAll(): Promise<Client[]>;
  update(id: number, client: Client): Promise<Client | null>;
  delete(id: number): Promise<boolean>;
}
