import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";

// Load production environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.prod"), override: true });

const dataSourceProd = new DataSource({
  type: "postgres",
  port: +(process.env.POSTGRES_PORT || 6543),
  username: process.env.POSTGRES_USERNAME || "postgres",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_NAME || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  entities: [
    path.join(process.cwd(), "src/**/*.entity{.ts,.js}").replace(/\\/g, "/"),
  ],
  migrations: [
    path
      .join(process.cwd(), "src/database/migrations/*{.ts,.js}")
      .replace(/\\/g, "/"),
  ],
  migrationsRun: false,
  synchronize: false,
  ssl: { rejectUnauthorized: false },
});

export async function initializeDataSourceProd() {
  if (!dataSourceProd.isInitialized) {
    await dataSourceProd.initialize();
  }
  return dataSourceProd;
}

export default dataSourceProd;
