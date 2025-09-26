import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with proper Neon configuration
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
  
  // Ensure SSL is enabled for Neon connections
  const databaseUrl = process.env.DATABASE_URL.includes('?') 
    ? process.env.DATABASE_URL 
    : `${process.env.DATABASE_URL}?sslmode=require`
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
