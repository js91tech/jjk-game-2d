import { getApiBase } from './baseUrl.js';

let accessToken = null;
let devHeaders = {};

export function setAccessToken(token) {
  accessToken = token;
}

export function setDevAuth(discordId, username) {
  devHeaders = { 'X-Discord-Id': discordId, 'X-Discord-Username': username };
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...devHeaders
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${getApiBase()}${path}`, { ...options, headers });
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
