import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

// Create and configure Prisma client with connection pool settings
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Set up connection pool management
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Handle graceful shutdown of Prisma connections
process.on('beforeExit', async () => {
  console.log('Closing database connections...');
  await prisma.$disconnect();
  console.log('Database connections closed');
});

// Log the database connection status
console.log(`Database connection initialized with ${process.env.NODE_ENV} settings`);
console.log(`Database URL defined: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`); 