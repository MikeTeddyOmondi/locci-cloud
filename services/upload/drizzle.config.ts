const { defineConfig } = require("drizzle-kit");

module.exports = defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schema.js",
  out: "./migrations",
  dbCredentials: {
    url: "postgres://postgres:password@172.26.123.215:5432/data_access_layer",
  }
});
