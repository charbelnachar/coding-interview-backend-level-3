describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should use localhost host in test environment', () => {
    process.env.NODE_ENV = 'test';
    const { loadConfig } = require('../../../src/config');
    const config = loadConfig();
    expect(config.host).toBe('localhost');
    expect(config.nodeEnv).toBe('test');
  });

  it('should use 0.0.0.0 host in production environment', () => {
    process.env.NODE_ENV = 'production';
    const { loadConfig } = require('../../../src/config');
    const config = loadConfig();
    expect(config.host).toBe('0.0.0.0');
  });

  it('should read postgres config from env vars', () => {
    process.env.NODE_ENV = 'production';
    process.env.DB_HOST = 'myhost';
    process.env.DB_PORT = '5433';
    process.env.DB_USERNAME = 'admin';
    process.env.DB_PASSWORD = 'secret';
    process.env.DB_NAME = 'mydb';

    const { loadConfig } = require('../../../src/config');
    const config = loadConfig();
    expect(config.db.host).toBe('myhost');
    expect(config.db.port).toBe(5433);
    expect(config.db.username).toBe('admin');
    expect(config.db.password).toBe('secret');
    expect(config.db.database).toBe('mydb');
  });

  it('should use default values when env vars are absent', () => {
    process.env.NODE_ENV = 'development';
    process.env.DB_HOST = undefined;
    process.env.DB_PORT = undefined;
    process.env.PORT = undefined;

    const { loadConfig } = require('../../../src/config');
    const config = loadConfig();
    expect(config.db.host).toBe('localhost');
    expect(config.db.port).toBe(5432);
    expect(config.port).toBe(3000);
  });
});
