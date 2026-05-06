export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface AppConfig {
  nodeEnv: string;
  host: string;
  port: number;
  db: DatabaseConfig;
}

/**
 * Loads application configuration from environment variables.
 *
 * Reads NODE_ENV, HOST, PORT, and database connection variables.
 *
 * Returns:
 *   The fully resolved application config used by the server bootstrap.
 */
export function loadConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isTest = nodeEnv === 'test';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = Number.parseInt(process.env.DB_PORT || '5432', 10);
  const dbUsername = process.env.DB_USERNAME || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'postgres';
  const dbName = process.env.DB_NAME || 'items_db';

  return {
    nodeEnv,
    host: isTest ? 'localhost' : process.env.HOST || '0.0.0.0',
    port: Number.parseInt(process.env.PORT || '3000', 10),
    db: {
      host: dbHost,
      port: dbPort,
      username: dbUsername,
      password: dbPassword,
      database: dbName,
    },
  };
}
