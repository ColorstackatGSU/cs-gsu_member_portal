import { api } from './api';

/**
 * The sites a member has connected through "Sign in with ColorStack at GSU", and the
 * call that cuts one off.
 *
 * Mirrors ConnectionsService.Connection.
 */
export type Connection = {
  /** What revoking keys on. Never shown to the member. */
  clientId: string;
  clientName: string;
  scopes: string[];
  /** ISO timestamp, or null for a grant caught before its first token was issued. */
  connectedAt: string | null;
};

/**
 * Scope names in the member's words rather than the protocol's.
 *
 * A member deciding whether to cut off a site should not have to work out what "socials"
 * covers. These say what the other site can actually see, in the order a person would
 * care about it — identity first, then contact, then the things that feel most personal.
 *
 * An unknown scope falls back to its raw name rather than being hidden. A scope this list
 * has not caught up with is exactly the one a member most needs to see.
 */
const SCOPE_LABELS: Record<string, string> = {
  openid: 'That you are a member',
  profile: 'Your name, pronouns, major and graduation',
  email: 'Your email addresses',
  phone: 'Your phone number',
  socials: 'Your LinkedIn and GitHub',
  discord: 'Your Discord username',
  demographics: 'Your race and ethnicity',
  resume: 'A copy of your resume',
};

const SCOPE_ORDER = ['openid', 'profile', 'email', 'phone', 'socials', 'discord', 'demographics', 'resume'];

export function describeScopes(scopes: string[]): string[] {
  return [...scopes]
    .sort((a, b) => {
      const ai = SCOPE_ORDER.indexOf(a);
      const bi = SCOPE_ORDER.indexOf(b);
      // Anything unrecognised sorts last rather than to the front on a -1.
      return (ai === -1 ? SCOPE_ORDER.length : ai) - (bi === -1 ? SCOPE_ORDER.length : bi);
    })
    .map((scope) => SCOPE_LABELS[scope] ?? scope);
}

/** Whether this connection took a copy of something we cannot take back. */
export function keepsACopy(scopes: string[]): boolean {
  return scopes.includes('resume');
}

export const connectionsApi = {
  list: () => api.get<Connection[]>('/members/me/connections'),
  /** Returns 204 whether or not there was anything left to revoke. */
  revoke: (clientId: string) =>
    api.del<void>(`/members/me/connections/${encodeURIComponent(clientId)}`),
};
