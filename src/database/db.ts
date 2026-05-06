import { PrismaClient } from '@prisma/client';
import { loadConfig } from '../config/index.js';

if (!process.env.DATABASE_URL) {
  const { db } = loadConfig();
  process.env.DATABASE_URL = `postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`;
}

/** Singleton Prisma client shared across all modules. */
export const prisma = new PrismaClient();

/**
 * Opens the database connection pool.
 *
 * Should be called once during application startup before any queries are made.
 */
export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

/**
 * Closes the database connection pool.
 *
 * Should be called during graceful shutdown to release DB resources.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
