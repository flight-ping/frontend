const BASE_URL = 'http://localhost:8080';

let cachedUserId: string | null = null;

async function getUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;
  try {
    const { getAnonymousKey } = await import('@apps-in-toss/framework');
    const result = await getAnonymousKey();
    if (!result || result === 'ERROR') {
      cachedUserId = 'dev-user-001';
    } else {
      cachedUserId = result.hash;
    }
  } catch {
    cachedUserId = 'dev-user-001';
  }
  return cachedUserId;
}

export async function apiGet<T>(path: string): Promise<T> {
  const userId = await getUserId();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-User-Id': userId },
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body?: object): Promise<T> {
  const userId = await getUserId();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiDelete(path: string): Promise<void> {
  const userId = await getUserId();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { 'X-User-Id': userId },
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
}
