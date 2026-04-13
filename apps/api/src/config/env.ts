export function getEnv() {
  return {
    host: process.env.HOST ?? 'localhost',
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    databaseUrl: process.env.DATABASE_URL ?? '',
    webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:4200',
  };
}
