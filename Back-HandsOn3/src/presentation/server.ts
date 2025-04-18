import express, { type Express, type Request, type Response } from 'express';
import { setUserRoutes } from './Users/routes/UserRoutes';
import { setServiceOrderRoutes } from './ServiceOrders/routes/ServiceOrderRoutes';
import cors from 'cors';
import { setReportRoutes } from './ServiceOrders/routes/ReportRoutes';
import { setClientRoutes } from './Clients/routes/ClientRoutes';
import { setDashboardRoutes } from './Dashboard/routes/DashboardRoutes';

export class Server {
  private app: Express;
  private port: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || '3000';

    this.app.use(cors());
    this.app.use(express.json());

    this.app.get('/', (_req: Request, res: Response) => {
      res.json({
        msg: 'Welcome to the API'
      });
    });

    setDashboardRoutes(this.app);
    setClientRoutes(this.app);
    setReportRoutes(this.app);
    setUserRoutes(this.app);
    setServiceOrderRoutes(this.app);
  }

  listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
