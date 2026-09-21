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

const getMigrationsPatterns = () => {
  const dir =
    typeof __dirname !== "undefined"
      ? path.join(__dirname, "migrations")
      : path.join(process.cwd(), "src/database/migrations");
  return [
    path.join(dir, "*.ts").replace(/\\/g, "/"),
    path.join(dir, "*.js").replace(/\\/g, "/"),
  ];
};

const dataSource = new DataSource({
  type: "postgres",
  port: +(process.env.POSTGRES_PORT || 5432),
  username: process.env.POSTGRES_USERNAME || "user",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_NAME || "dbname",
  host: process.env.POSTGRES_HOST || "localhost",
  entities: [
    path.join(getBaseDir(), "**/*.entity{.ts,.js}").replace(/\\/g, "/"),
  ],
  migrations: getMigrationsPatterns(),
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
