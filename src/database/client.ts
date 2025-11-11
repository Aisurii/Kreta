import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Prisma client singleton to prevent multiple instances
// This is especially important in development with hot reloading

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Log Prisma warnings and errors
prisma.$on('warn', (e) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Graceful shutdown handler
export async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('Disconnected from database');
}
