import * as dotenv from "dotenv";
import * as path from "path";
import { DataSource } from "typeorm";

dotenv.config({
  path: path.resolve(__dirname, "..", ".env.prod"),
  override: true,
});

const dataSource = new DataSource({
  type: "postgres",
  port: +process.env.POSTGRES_PORT || 6543,
  username: process.env.POSTGRES_USERNAME || "postgres",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_NAME || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  ssl: { rejectUnauthorized: false },
});

async function check() {
  await dataSource.initialize();
  const tables = await dataSource.query(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
    ORDER BY table_name;
  `);
  console.log("Existing tables in DB:", tables);
  await dataSource.destroy();
}

check().catch(console.error);
