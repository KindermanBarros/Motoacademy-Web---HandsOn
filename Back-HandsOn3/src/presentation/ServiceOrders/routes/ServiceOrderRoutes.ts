import { Router } from "express";
import { ServiceOrderController } from "../controllers/ServiceOrderController";

const router = Router();
const serviceOrderController = new ServiceOrderController();

export function setServiceOrderRoutes(app: any) {
  app.use("/service-orders", router);
  router.post("/", serviceOrderController.create.bind(serviceOrderController));
}
