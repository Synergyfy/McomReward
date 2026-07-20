const { DataSource } = require("typeorm");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

async function main() {
  const ds = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port: +(process.env.POSTGRES_PORT || 5432),
    username: process.env.POSTGRES_USERNAME || "postgres",
    password: process.env.POSTGRES_PASSWORD || "password",
    database: process.env.POSTGRES_NAME || "McomLoyalty",
    entities: [path.resolve(__dirname, "src") + "/**/*.entity{.ts,.js}"],
    migrations: [path.join(__dirname, "src/database/migrations/*.ts")],
    synchronize: false,
  });

  await ds.initialize();
  console.log("Connected to DB");

  const migrations = await ds.runMigrations();
  console.log("Executed migrations:", migrations.length);

  for (const m of migrations) {
    console.log("  -", m.name);
  }

  await ds.destroy();
  console.log("Done");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
