import express from "express";
import { setUserRoutes } from "./Users/routes/UserRoutes";
import { setServiceOrderRoutes } from "./ServiceOrders/routes/ServiceOrderRoutes";

export function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json());
  setUserRoutes(app);
  setServiceOrderRoutes(app);

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
