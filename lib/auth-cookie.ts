import { UserSession } from './types';

const COOKIE_NAME = 'caresync_session';

export function setAuthCookie(session: UserSession): void {
  if (typeof document === 'undefined') return;
  const json = encodeURIComponent(JSON.stringify(session));
  // Set cookie for 7 days
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${json}; path=/; expires=${expires}; SameSite=Lax`;
}

export function getAuthCookie(): UserSession | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;

  try {
    const json = decodeURIComponent(match.split('=')[1]);
    return JSON.parse(json) as UserSession;
  } catch {
    return null;
  }
}

export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
