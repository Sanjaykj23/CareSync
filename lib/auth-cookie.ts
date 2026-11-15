import { UserSession } from './types';

const COOKIE_NAME = 'caresync_session';
const STORAGE_KEY = 'caresync_user_session';

export function setAuthCookie(session: UserSession): void {
  if (typeof window === 'undefined') return;

  const json = JSON.stringify(session);

  // 1. Set document.cookie (URL-encoded to prevent character collisions)
  const encoded = encodeURIComponent(json);
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encoded}; path=/; expires=${expires}; SameSite=Lax`;

  // 2. Set localStorage backup (instant, zero-latency fail-safe)
  try {
    localStorage.setItem(STORAGE_KEY, json);
  } catch {}
}

export function getAuthCookie(): UserSession | null {
  if (typeof window === 'undefined') return null;

  // 1. Try parsing from document.cookie
  const cookieString = document.cookie || '';
  const cookies = cookieString.split(';');
  let rawValue: string | null = null;

  for (const c of cookies) {
    const trimmed = c.trim();
    if (trimmed.startsWith(`${COOKIE_NAME}=`)) {
      rawValue = trimmed.substring(`${COOKIE_NAME}=`.length);
      break;
    }
  }

  if (rawValue) {
    try {
      let decoded = rawValue;
      // Handle potential single or double URI encoding from Next.js response cookies
      let iterations = 0;
      while (decoded.includes('%') && iterations < 3) {
        try {
          const next = decodeURIComponent(decoded);
          if (next === decoded) break;
          decoded = next;
        } catch {
          break;
        }
        iterations++;
      }

      const parsed = JSON.parse(decoded) as UserSession;
      if (parsed && parsed.role) {
        return parsed;
      }
    } catch (err) {
      console.warn('Cookie parse warning:', err);
    }
  }

  // 2. Fallback to localStorage backup
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local) as UserSession;
      if (parsed && parsed.role) {
        return parsed;
      }
    }
  } catch {}

  return null;
}

export function clearAuthCookie(): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
