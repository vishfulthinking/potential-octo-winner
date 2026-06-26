import { PrismaClient } from "@prisma/client"
import { createClient } from "@libsql/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const globalForPrisma = globalThis

const connectionString = process.env.DATABASE_URL || "file:./dev.db";

let prisma

if (!globalForPrisma.prisma) {
  const libsql = createClient({
    url: connectionString,
  })
  const adapter = new PrismaLibSql(libsql)
  globalForPrisma.prisma = new PrismaClient({ adapter })
}

prisma = globalForPrisma.prisma

export default prisma
