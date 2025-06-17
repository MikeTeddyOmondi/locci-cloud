import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./build/database/schema.js",
  out: "./migrations",
  dbCredentials: {
    url: "postgres://postgres:password@localhost:5432/upload_service",
  }
});
