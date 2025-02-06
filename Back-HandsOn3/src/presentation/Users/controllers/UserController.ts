import type { Request, Response } from 'express';
import type { RequestHandler } from 'express';
import { PrismaUserRepository } from '../../../infrastructure/Users/PrismaUserRepository';
import {
  CreateUser,
  GetUserById,
  GetAllUsers,
  UpdateUser,
  DeleteUser
} from '../../../application/Users/use-cases';
import { User } from '../../../domain/Users/entities/User';
import { UserDTO } from '../../../application/Users/dto';
import { HttpError } from '../../shared/errors/HttpError';

export class UserController {
  private readonly repository: PrismaUserRepository;
  private readonly createUseCase: CreateUser;
  private readonly getByIdUseCase: GetUserById;
  private readonly getAllUseCase: GetAllUsers;
  private readonly updateUseCase: UpdateUser;
  private readonly deleteUseCase: DeleteUser;

  constructor() {
    this.repository = new PrismaUserRepository();
    this.createUseCase = new CreateUser(this.repository);
    this.getByIdUseCase = new GetUserById(this.repository);
    this.getAllUseCase = new GetAllUsers(this.repository);
    this.updateUseCase = new UpdateUser(this.repository);
    this.deleteUseCase = new DeleteUser(this.repository);
  }

  getAll: RequestHandler = async (_req: Request, res: Response) => {
    try {
      const users = await this.getAllUseCase.execute();
      const userDTOs = users.map(
        (user) => new UserDTO(user.id, user.name, user.email)
      );
      res.status(200).json(userDTOs);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getById: RequestHandler = async (req: Request, res: Response) => {
    try {
      const id = this.validateId(req.params.id);
      const user = await this.getByIdUseCase.execute(id);

      if (!user) {
        throw new HttpError(404, 'User not found');
      }

      res.status(200).json(new UserDTO(user.id, user.name, user.email));
    } catch (error) {
      this.handleError(error, res);
    }
  };

  create: RequestHandler = async (req: Request, res: Response) => {
    try {
      const { name, email } = req.body;
      this.validateUserInput(name, email);

      const user = new User(0, name, email);
      const createdUser = await this.createUseCase.execute(user);

      res
        .status(201)
        .json(new UserDTO(createdUser.id, createdUser.name, createdUser.email));
    } catch (error) {
      this.handleError(error, res);
    }
  };

  update: RequestHandler = async (req: Request, res: Response) => {
    try {
      const id = this.validateId(req.params.id);
      const { name, email } = req.body;
      this.validateUserInput(name, email);

      const user = new User(id, name, email);
      const updatedUser = await this.updateUseCase.execute(id, user);

      if (!updatedUser) {
        throw new HttpError(404, 'User not found');
      }

      res
        .status(200)
        .json(new UserDTO(updatedUser.id, updatedUser.name, updatedUser.email));
    } catch (error) {
      this.handleError(error, res);
    }
  };

  delete: RequestHandler = async (req: Request, res: Response) => {
    try {
      const id = this.validateId(req.params.id);
      const deleted = await this.deleteUseCase.execute(id);

      if (!deleted) {
        throw new HttpError(404, 'User not found');
      }

      res.status(200).json({
        message: 'User deleted successfully',
        id
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  private validateId(id: string): number {
    const numId = Number(id);
    if (Number.isNaN(numId) || numId <= 0) {
      throw new HttpError(400, 'Invalid ID format');
    }
    return numId;
  }

  private validateUserInput(name: unknown, email: unknown): void {
    if (!name || !email) {
      throw new HttpError(400, 'Name and email are required');
    }

    if (typeof name !== 'string' || typeof email !== 'string') {
      throw new HttpError(400, 'Invalid input types');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpError(400, 'Invalid email format');
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    if (error instanceof Error && error.message === 'Email already exists') {
      res.status(409).json({ message: error.message });
      return;
    }

    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
