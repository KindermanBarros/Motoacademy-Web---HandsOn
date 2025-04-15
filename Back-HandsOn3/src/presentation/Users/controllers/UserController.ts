import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import type { RequestHandler } from "express";
import { PrismaUserRepository } from "../../../infrastructure/Users/PrismaUserRepository";
import {
  CreateUser,
  GetUserById,
  GetAllUsers,
  UpdateUser,
  DeleteUser,
} from "../../../application/Users/use-cases";
import { User } from "../../../domain/Users/entities/User";
import { UserDTO } from "../../../application/Users/dto";
import { HttpError } from "../../shared/errors/HttpError";
import { LoginUser } from "../../../application/Users/use-cases/LoginUser";
type JwtPayload = {
  id: number;
};

export class UserController {
  private readonly repository: PrismaUserRepository;
  private readonly createUseCase: CreateUser;
  private readonly getByIdUseCase: GetUserById;
  private readonly getAllUseCase: GetAllUsers;
  private readonly updateUseCase: UpdateUser;
  private readonly deleteUseCase: DeleteUser;
  private readonly loginUseCase: LoginUser;

  constructor() {
    this.repository = new PrismaUserRepository();
    this.createUseCase = new CreateUser(this.repository);
    this.getByIdUseCase = new GetUserById(this.repository);
    this.getAllUseCase = new GetAllUsers(this.repository);
    this.updateUseCase = new UpdateUser(this.repository);
    this.deleteUseCase = new DeleteUser(this.repository);
    this.loginUseCase = new LoginUser(this.repository);
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
        throw new HttpError(404, "User not found");
      }

      res.status(200).json(new UserDTO(user.id, user.name, user.email));
    } catch (error) {
      this.handleError(error, res);
    }
  };

  create: RequestHandler = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      this.validateUserInput(name, email, password);

      const user = new User(0, name, email, password);
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

      const { name, email, password } = req.body;

      this.validateUserInput(name, email, password);

      const existingUser = await this.repository.getById(id);

      if (!existingUser) {
        throw new HttpError(404, "User not found");
      }

      const user = new User(id, name, email, password ?? existingUser.password);

      const updatedUser = await this.updateUseCase.execute(id, user);
      if (!updatedUser) {
        throw new HttpError(404, "User not found");
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
        throw new HttpError(404, "User not found");
      }

      res.status(200).json({
        message: "User deleted successfully",
        id,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  login: RequestHandler = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new HttpError(400, "Email and password are required");
      }

      const user = await this.loginUseCase.execute(email, password);

      if (!user) {
        throw new HttpError(401, "Invalid credentials");
      }

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET ?? "",
        { expiresIn: "24h" }
      );

      res.status(200).json({
        user: new UserDTO(user.id, user.name, user.email),
        token
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getProfile: RequestHandler = async (req, res) => {
    try {
      const { authorization } = req.headers;

      if (!authorization) {
        throw new HttpError(401, "Não autorizado");
      }

      const token = authorization.split(" ")[1];

      if (!token) {
        throw new HttpError(401, "Token inválido");
      }

      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET ?? ""
      ) as JwtPayload;

      const { id } = decodedToken;

      if (!id) {
        throw new HttpError(400, "ID do usuário não encontrado no token");
      }

      if (!req.user || !req.userId) {
        throw new HttpError(401, 'Unauthorized');
      }

      const user = await this.repository.getById(req.userId);
      if (!user) {
        throw new HttpError(404, 'User not found');
      }

      res.status(200).json(new UserDTO(user.id, user.name, user.email));
    } catch (error) {
      this.handleError(error, res);
    }
  };

  private validateId(id: string): number {
    const numId = Number(id);
    if (Number.isNaN(numId) || numId <= 0) {
      throw new HttpError(400, "Invalid ID format");
    }
    return numId;
  }

  private validateUserInput(
    name: unknown,
    email: unknown,
    password?: unknown
  ): void {
    if (!name || !email || !password) {
      throw new HttpError(400, "Name, email and password are required");
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      throw new HttpError(400, "Invalid input types");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpError(400, "Invalid email format");
    }

    if (password.length < 6) {
      throw new HttpError(400, "Password must be at least 6 characters long");
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    if (error instanceof Error && error.message === "Email already exists") {
      res.status(409).json({ message: error.message });
      return;
    }

    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
