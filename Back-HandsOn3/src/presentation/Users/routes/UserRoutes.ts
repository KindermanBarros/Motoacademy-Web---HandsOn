import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();
const userController = new UserController();

export function setUserRoutes(app: any) {
  app.use("/users", router);
  router.post("/", userController.create.bind(userController));
  router.get("/:id", userController.getById.bind(userController));
}
