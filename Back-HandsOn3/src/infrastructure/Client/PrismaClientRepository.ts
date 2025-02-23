import type { IClientRepository } from '../../domain/Clients/repository/ClientRepository';
import { Client } from '../../domain/Clients/entities/Client';
import prisma from '../prisma/client';

export class PrismaClientRepository implements IClientRepository {
  async create(client: Client): Promise<Client> {
    const created = await prisma.client.create({
      data: {
        name: client.name,
        email: client.email,
        cnpj: client.cnpj
      }
    });

    return new Client(created.id, created.name, created.email, created.cnpj);
  }

  async getById(id: number): Promise<Client | null> {
    const client = await prisma.client.findUnique({ where: { id } });
    return client
      ? new Client(client.id, client.name, client.email, client.cnpj)
      : null;
  }

  async getAll(): Promise<Client[]> {
    const clients = await prisma.client.findMany();
    return clients.map(
      (client) => new Client(client.id, client.name, client.email, client.cnpj)
    );
  }

  async update(id: number, client: Client): Promise<Client | null> {
    try {
      const updated = await prisma.client.update({
        where: { id },
        data: {
          name: client.name,
          email: client.email,
          cnpj: client.cnpj
        }
      });

      return new Client(updated.id, updated.name, updated.email, updated.cnpj);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.client.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
