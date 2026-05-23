import { DiscordSDK } from '@discord/embedded-app-sdk';
import { setAccessToken, setDevAuth } from '../api/client.js';
import { getApiBase, isDiscordActivity } from '../api/baseUrl.js';

const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || '';

function authFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('discord_id');
  if (!id) return null;
  const username = params.get('username') || 'Sorcerer';
  setDevAuth(id, username);
  localStorage.setItem('jjk_dev_id', id);
  localStorage.setItem('jjk_dev_name', username);
  params.delete('discord_id');
  params.delete('username');
  const rest = params.toString();
  const path = window.location.pathname + (rest ? `?${rest}` : '') + window.location.hash;
  window.history.replaceState({}, '', path);
  return { id, username, dev: true, fromWeb: true };
}

async function exchangeCodeForToken(discordSdk, code) {
  const res = await fetch(`${getApiBase()}/v1/auth/code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    const detail = data.detail?.error_description || data.detail?.message || data.message;
    throw new Error(
      detail || `OAuth exchange failed (${res.status}). Check jjk-api DISCORD_CLIENT_SECRET and OAuth redirect http://127.0.0.1/callback`
    );
  }
  setAccessToken(data.access_token);
  await discordSdk.commands.authenticate({ access_token: data.access_token });
  return { id: data.discordId, username: data.username };
}

export async function authenticate() {
  const fromUrl = authFromUrl();
  if (fromUrl) return fromUrl;

  if (import.meta.env.VITE_DEV_DISCORD_ID) {
    const id = import.meta.env.VITE_DEV_DISCORD_ID;
    const name = import.meta.env.VITE_DEV_USERNAME || 'DevPlayer';
    setDevAuth(id, name);
    return { id, username: name, dev: true };
  }

  if (isDiscordActivity()) {
    const clientId = CLIENT_ID;
    if (!clientId) {
      throw new Error(
        'VITE_DISCORD_CLIENT_ID missing on jjk-game-2d build. Redeploy 2D with your Discord Application ID.'
      );
    }
    const discordSdk = new DiscordSDK(clientId);
    await discordSdk.ready();
    const { code } = await discordSdk.commands.authorize({
      client_id: clientId,
      response_type: 'code',
      state: '',
      prompt: 'none',
      scope: ['identify']
    });
    return exchangeCodeForToken(discordSdk, code);
  }

  const stored = localStorage.getItem('jjk_dev_id');
  const id =
    stored ||
    prompt(
      'Enter your Discord user ID (same account as bot — Developer Mode → Copy User ID):',
      ''
    );
  if (!id) throw new Error('Discord ID required');
  localStorage.setItem('jjk_dev_id', id);
  const name = localStorage.getItem('jjk_dev_name') || 'Sorcerer';
  setDevAuth(id, name);
  return { id, username: name, dev: true };
}
