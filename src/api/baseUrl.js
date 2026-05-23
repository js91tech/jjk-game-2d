/**
 * Discord Activities block direct calls to external APIs (CSP).
 * In the Activity iframe use Discord's proxy: /.proxy/api → URL mapping → jjk-api host.
 * Local dev / browser: use VITE_API_URL (e.g. http://localhost:3848).
 */
export function getApiBase() {
  const env = (import.meta.env.VITE_API_URL || 'http://localhost:3848').replace(/\/$/, '');
  const inDiscordIframe =
    typeof window !== 'undefined' && window.parent !== window && window.parent !== null;
  if (inDiscordIframe) {
    return '/.proxy/api';
  }
  return env;
}
