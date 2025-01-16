import dotenv from "dotenv";

const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env";

dotenv.config({ path: envFile });

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

if (!process.env.PORT) {
  throw new Error("Missing PORT environment variable.");
}

export const AppConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  port: Number(process.env.PORT) || 3000,
};
