import { config } from 'dotenv';
import { Server } from './presentation/server';

const startServer = async () => {
  try {
    config();

    const server = new Server();
    server.listen();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
