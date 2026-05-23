import { getApiBase } from './baseUrl.js';

let accessToken = null;
let sessionToken = null;
let devHeaders = {};

export function setAccessToken(token) {
  accessToken = token;
}

/** Prefer session token from /v1/auth/code (works reliably through Discord proxy). */
export function setSessionToken(token) {
  sessionToken = token;
}

export function setDevAuth(discordId, username) {
  devHeaders = { 'X-Discord-Id': discordId, 'X-Discord-Username': username };
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...devHeaders
  };
  let method = options.method || 'GET';
  let body = options.body;

  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
    headers['X-JJK-Session'] = sessionToken;
    if (method === 'GET') {
      method = 'POST';
      const payload = body ? JSON.parse(body) : {};
      body = JSON.stringify({ ...payload, session_token: sessionToken });
    }
  } else if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${getApiBase()}${path}`, { ...options, method, headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `API ${res.status}`);
  }
  return data;
}

export const api = {
  me: () => request('/v1/me'),
  crimes: () => request('/v1/crimes'),
  train: (stat, sets) => request('/v1/train', { method: 'POST', body: JSON.stringify({ stat, sets }) }),
  crime: (mission) => request('/v1/crime', { method: 'POST', body: JSON.stringify({ mission }) }),
  work: () => request('/v1/work', { method: 'POST', body: JSON.stringify({}) }),
  attack: (targetDiscordId) =>
    request('/v1/attack', { method: 'POST', body: JSON.stringify({ targetDiscordId }) }),
  explore: () => request('/v1/explore'),
  move: (direction) => request('/v1/explore/move', { method: 'POST', body: JSON.stringify({ direction }) }),
  escape: (place, method) =>
    request('/v1/escape', { method: 'POST', body: JSON.stringify({ place, method }) }),
  players: () => request('/v1/players')
};
