/**
 * API client for Backend calls. Use with useAuth().getAccessToken() for authenticated requests.
 * Automatically adds Authorization header and credentials: 'include' for cookies.
 */
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const API_PREFIX = '/api/v1';

export interface ApiFetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: HeadersInit;
  getAccessToken?: () => string | null;
}

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const { getAccessToken, headers: rawHeaders, ...rest } = options;
  const url = path.startsWith('http') ? path : `${API_URL}${API_PREFIX}${path}`;
  const headers = new Headers(rawHeaders);
  const token = getAccessToken?.();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(url, { ...rest, headers, credentials: 'include' });
}
