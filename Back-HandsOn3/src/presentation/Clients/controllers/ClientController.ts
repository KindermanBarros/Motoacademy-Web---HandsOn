import type { Request, Response, RequestHandler } from "express";
import { Client } from "../../../domain/Clients/entities/Client";
import { PrismaClientRepository } from "../../../infrastructure/Client/PrismaClientRepository";
import { HttpError } from "../../shared/errors/HttpError";

export class ClientController {
  private readonly repository: PrismaClientRepository;

  constructor() {
    this.repository = new PrismaClientRepository();
  }

  create: RequestHandler = async (req: Request, res: Response) => {
    try {
      const { name, email, cnpj } = req.body;
      this.validateClientInput(name, email, cnpj);

      const client = new Client(0, name, email, cnpj);
      const created = await this.repository.create(client, req.userId);

      res.status(201).json(created);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getAll: RequestHandler = async (req: Request, res: Response) => {
    try {
      const user = req.user;

      if (!user) {
        throw new HttpError(401, "User not authenticated");
      }

      let clients;
      if (user.role === "ADMIN") {
        clients = await this.repository.getAll();
      } else {
        clients = await this.repository.getAllByUserId(user.id);
      }
      res.json(clients);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getById: RequestHandler = async (req: Request, res: Response) => {
    try {
      const id = this.validateId(req.params.id);
      const client = await this.repository.getById(id);

      if (!client) {
        throw new HttpError(404, "Client not found");
      }

      const clientOwner = await this.repository.isClientOwner(id, req.userId);
      if (req.user?.role !== 'ADMIN' && !clientOwner) {
        throw new HttpError(403, 'Not authorized to access this client');
      }


      res.json(client);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  update: RequestHandler = async (req: Request, res: Response) => {
    try {
      const id = this.validateId(req.params.id);

      const clientOwner = await this.repository.isClientOwner(id, req.userId);
      if (!clientOwner) {
        throw new HttpError(403, "Not authorized to update this client");
      }

      const { name, email, cnpj } = req.body;
      this.validateClientInput(name, email, cnpj);

      const client = new Client(id, name, email, cnpj);
      const updated = await this.repository.update(id, client);

      if (!updated) {
        throw new HttpError(404, "Client not found");
      }

      res.json(updated);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  delete: RequestHandler = async (req: Request, res: Response) => {
    try {
      const id = this.validateId(req.params.id);

      const clientOwner = await this.repository.isClientOwner(id, req.userId);
      if (!clientOwner) {
        throw new HttpError(403, "Not authorized to delete this client");
      }

      const deleted = await this.repository.delete(id);

      if (!deleted) {
        throw new HttpError(404, "Client not found");
      }

      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  };

  private validateId(id: string): number {
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      throw new HttpError(400, "Invalid ID format");
    }
    return numId;
  }

  private validateClientInput(
    name: unknown,
    email: unknown,
    cnpj: unknown
  ): void {
    if (!name || !email || !cnpj) {
      throw new HttpError(400, "Name, email and CNPJ are required");
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof cnpj !== "string"
    ) {
      throw new HttpError(400, "Invalid input types");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpError(400, "Invalid email format");
    }

    const normalizedCnpj = cnpj.replace(/\D/g, "");

    if (normalizedCnpj.length !== 14) {
      throw new HttpError(400, "CNPJ must have exactly 14 digits");
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
