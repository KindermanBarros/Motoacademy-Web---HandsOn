import type { Request, Response } from 'express';
import { PrismaUserRepository } from '../../../infrastructure/Users/PrismaUserRepository';
import {
  CreateUser,
  GetUserById,
  GetAllUsers,
  UpdateUser,
  DeleteUser
} from '../../../application/Users/use-cases';
import { User } from '../../../domain/Users/entities/User';
import {
  UserDTO,
  CreateUserDTO,
  UpdateUserDTO
} from '../../../application/Users/dto';
import { HttpError } from '../../shared/errors/HttpError';

const userRepository = new PrismaUserRepository();
const createUser = new CreateUser(userRepository);
const getUserById = new GetUserById(userRepository);
const getAllUsers = new GetAllUsers(userRepository);
const updateUser = new UpdateUser(userRepository);
const deleteUser = new DeleteUser(userRepository);

export class UserController {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const users = await getAllUsers.execute();
      const userDTOs = users.map(
        (user) => new UserDTO(user.id, user.name, user.email)
      );
      res.status(200).json(userDTOs);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = this.validateId(req.params.id);
      const user = await getUserById.execute(id);
      if (!user) {
        throw new HttpError(404, 'User not found');
      }
      res.status(200).json(new UserDTO(user.id, user.name, user.email));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      this.validateCreateUserInput(req.body);
      const createUserDTO = new CreateUserDTO(req.body.name, req.body.email);
      const user = new User(0, createUserDTO.name, createUserDTO.email);
      const createdUser = await createUser.execute(user);
      res
        .status(201)
        .json(new UserDTO(createdUser.id, createdUser.name, createdUser.email));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = this.validateId(req.params.id);
      this.validateUpdateUserInput(req.body);
      const updateUserDTO = new UpdateUserDTO(req.body.name, req.body.email);
      const user = new User(id, updateUserDTO.name, updateUserDTO.email);
      const updatedUser = await updateUser.execute(id, user);
      if (!updatedUser) {
        throw new HttpError(404, 'User not found');
      }
      res
        .status(200)
        .json(new UserDTO(updatedUser.id, updatedUser.name, updatedUser.email));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = this.validateId(req.params.id);
      await deleteUser.execute(id);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private validateId(id: string): number {
    const numId = Number(id);
    if (Number.isNaN(numId) || numId <= 0) {
      throw new HttpError(400, 'Invalid ID format');
    }
    return numId;
  }

  private validateCreateUserInput(body: User): void {
    if (!body.name || !body.email) {
      throw new HttpError(400, 'Name and email are required');
    }
    if (typeof body.name !== 'string' || typeof body.email !== 'string') {
      throw new HttpError(400, 'Invalid input types');
    }
    this.validateEmail(body.email);
  }

  private validateUpdateUserInput(body: User): void {
    if (!body.name || !body.email) {
      throw new HttpError(400, 'Name and email are required');
    }
    if (typeof body.name !== 'string' || typeof body.email !== 'string') {
      throw new HttpError(400, 'Invalid input types');
    }
    this.validateEmail(body.email);
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpError(400, 'Invalid email format');
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
