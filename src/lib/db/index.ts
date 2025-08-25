import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with fallback for missing DATABASE_URL
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found, using mock data mode')
    // Return a mock client that doesn't actually connect to database
    return new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://mock:mock@localhost:5432/mock'
        }
      }
    })
  }
  
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
