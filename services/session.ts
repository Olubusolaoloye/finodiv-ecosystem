const SESSION_KEY = 'finodiv_session';

export interface Session {
  userId: string;
  email: string;
}

export function getSession(): Session | null {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    if (!s) return null;
    const parsed = JSON.parse(s) as Session;
    return parsed?.userId ? parsed : null;
  } catch {
    return null;
  }
}
