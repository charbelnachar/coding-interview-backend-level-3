import { prisma } from '../db';

const SEED_ITEMS = [
  { name: 'Laptop', price: 999.99 },
  { name: 'Keyboard', price: 49.99 },
  { name: 'Mouse', price: 29.99 },
  { name: 'Monitor', price: 299.99 },
  { name: 'Headphones', price: 79.99 },
];

export async function runSeed(): Promise<void> {
  const count = await prisma.item.count();

  if (count === 0) {
    await prisma.item.createMany({ data: SEED_ITEMS });
    console.log(`Seeded ${SEED_ITEMS.length} items into the database`);
  } else {
    console.log('Database already has data, skipping seed');
  }
}
