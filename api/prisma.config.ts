import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { PrismaClient } from "./src/generated/index.js";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"]!,
  },
});
