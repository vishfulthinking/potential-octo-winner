import { PrismaClient } from "@prisma/client"
import Database from "better-sqlite3"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const globalForPrisma = globalThis

const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace("file:", "") : "./dev.db";

let prisma

if (!globalForPrisma.prisma) {
  const sqlite = new Database(connectionString);
  const adapter = new PrismaBetterSqlite3(sqlite);
  globalForPrisma.prisma = new PrismaClient({ adapter })
}

prisma = globalForPrisma.prisma

export default prisma
