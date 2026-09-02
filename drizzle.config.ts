import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL || "mysql://127.0.0.1:3306/rakiza";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});
