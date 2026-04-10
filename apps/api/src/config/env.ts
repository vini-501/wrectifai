export function getEnv() {
  return {
    host: process.env.HOST ?? 'localhost',
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
  };
}
