/**
 * Discord Activities: requests use URL mapping prefix /api (see Developer Portal).
 * Local dev / browser: use VITE_API_URL (e.g. http://localhost:3848).
 */
export function isDiscordActivity() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname || '';
  if (/\.discordsays\.com$/i.test(host)) return true;
  if (window.parent !== window && window.parent !== null) return true;
  return false;
}

export function getApiBase() {
  const env = (import.meta.env.VITE_API_URL || 'http://localhost:3848').replace(/\/$/, '');
  if (isDiscordActivity()) {
    return '/api';
  }
  return env;
}
