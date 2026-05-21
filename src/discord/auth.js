import { DiscordSDK } from '@discord/embedded-app-sdk';
import { setAccessToken, setDevAuth } from '../api/client.js';

const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || '';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3848';

export async function authenticate() {
  if (import.meta.env.VITE_DEV_DISCORD_ID) {
    const id = import.meta.env.VITE_DEV_DISCORD_ID;
    const name = import.meta.env.VITE_DEV_USERNAME || 'DevPlayer';
    setDevAuth(id, name);
    return { id, username: name, dev: true };
  }

  if (CLIENT_ID && window.parent !== window) {
    try {
      const discordSdk = new DiscordSDK(CLIENT_ID);
      await discordSdk.ready();
      const { code } = await discordSdk.commands.authorize({
        client_id: CLIENT_ID,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: ['identify']
      });
      const res = await fetch(`${API_URL}/v1/auth/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.access_token) {
        setAccessToken(data.access_token);
        return { id: data.discordId, username: data.username };
      }
    } catch (e) {
      console.warn('Discord SDK auth failed, falling back to dev', e);
    }
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
