export function getHealthStatus() {
  return {
    service: 'wrectifai-api',
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
}
