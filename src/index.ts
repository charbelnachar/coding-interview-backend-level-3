import dotenv from 'dotenv';
import { startServer } from './server';

dotenv.config();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

startServer();
