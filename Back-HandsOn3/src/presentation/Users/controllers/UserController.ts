import { Request, Response } from "express";
import { PrismaUserRepository } from "../../../infrastructure/Users/PrismaUserRepository";
import { CreateUser } from "../../../application/Users/use-cases/CreateUser";
import { GetUserById } from "../../../application/Users/use-cases/GetUserById";
import { User } from "../../../domain/Users/entities/User";

const userRepository = new PrismaUserRepository();
const createUser = new CreateUser(userRepository);
const getUserById = new GetUserById(userRepository);

export class UserController {
  async create(req: Request, res: Response): Promise<void> {
    const { name, email } = req.body;
    const user = new User(0, name, email);
    const createdUser = await createUser.execute(user);
    res.status(201).json(createdUser);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const user = await getUserById.execute(Number(id));
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  }
}
