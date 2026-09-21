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
  const tiers = await dataSource.query(
    `SELECT id, name, monthly_price, annual_price, is_default, status FROM "tier"`,
  );
  const plans = await dataSource.query(
    `SELECT id, name, slug, "isActive" FROM "plans"`,
  );
  console.log("Current Tiers in DB:", tiers);
  console.log("Current Plans in DB:", plans);
  await dataSource.destroy();
}

check().catch(console.error);
