import { supabase } from './supabase';

/**
 * The one way this app talks to the backend.
 *
 * It attaches the access token fresh on every call, so a background refresh is picked up,
 * and turns RFC 9457 problem responses into an ApiError whose message is safe to render.
 * Nearly every message a member sees comes from the server, so there is one set of wording
 * rather than two that drift.
 */

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type ProblemDetail = { detail?: string; title?: string };

async function toError(response: Response): Promise<ApiError> {
  let detail = '';
  try {
    const body = (await response.json()) as ProblemDetail;
    detail = body.detail ?? body.title ?? '';
  } catch {
    // A non-JSON body means something upstream of the API answered: a proxy, a cold
    // start, a network stub. There is nothing useful to show from it.
  }
  if (!detail) {
    detail =
      response.status === 401
        ? 'Your session has expired. Sign in again.'
        : 'Something went wrong. Try again in a moment.';
  }
  return new ApiError(response.status, detail);
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean } = {},
): Promise<T> {
  const { auth = true } = options;
  const headers = new Headers(init.headers);

  if (auth) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      throw new ApiError(401, 'Your session has expired. Sign in again.');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Left alone for FormData, so the browser can set the multipart boundary itself.
  if (init.body !== undefined && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    throw await toError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

/** Endpoints a member reaches before they have an account, so no token is attached. */
export const publicApi = {
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, { auth: false }),
};

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: 'POST', body: form }),
};
