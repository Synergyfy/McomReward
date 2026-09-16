import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

const getBaseDir = () => {
  if (typeof __dirname !== "undefined") {
    return path.resolve(__dirname, "..");
  }
  return path.resolve(process.cwd(), "src");
};

const getMigrationsPattern = () => {
  if (typeof __dirname !== "undefined") {
    return path.join(__dirname, "./migrations/*{.ts,.js}");
  }
  return path.join(process.cwd(), "src/database/migrations/*{.ts,.js}");
};

const dataSource = new DataSource({
  type: "postgres",
  port: +(process.env.POSTGRES_PORT || 5432),
  username: process.env.POSTGRES_USERNAME || "user",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_NAME || "dbname",
  host: process.env.POSTGRES_HOST || "localhost",
  entities: [path.join(getBaseDir(), "**/*.entity{.ts,.js}").replace(/\\/g, "/")],
  migrations: [getMigrationsPattern().replace(/\\/g, "/")],
  migrationsRun: true,
  synchronize: false,
});

export async function initializeDataSource() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

export default dataSource;
