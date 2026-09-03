import { publicApi } from './api';

/**
 * Signing in with Google.
 *
 * The sign-in itself is not a fetch: /auth/google/start is a browser navigation, because
 * OAuth is a round trip through Google and back, and a fetch cannot take the address bar
 * with it. Only the last step, collecting the session, is a normal API call.
 */

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

/** Mirrors GoogleOAuthController.Session. */
export type GoogleSession = {
  email: string;
  /** Handed straight to supabase.auth.verifyOtp, never stored. */
  tokenHash: string;
  /**
   * True when this sign-in is what claimed the account, rather than a later one. Lets the
   * portal say "your account is set up" the first time instead of a bare "welcome back".
   */
  activated: boolean;
};

export const googleApi = {
  /** Whether the backend has a client configured. False hides the button entirely. */
  available: () => publicApi.get<{ enabled: boolean }>('/auth/google/available'),

  /** Leaves the app. Everything after this happens at Google and then at /auth/callback. */
  start: () => {
    window.location.href = `${BASE_URL}/auth/google/start`;
  },

  claim: (handoff: string) =>
    publicApi.post<GoogleSession>('/auth/google/claim', { handoff }),
};

/**
 * What went wrong, in the member's words rather than OAuth's.
 *
 * The backend puts one of these on the redirect because it has nowhere else to say it: the
 * person is mid-sign-in in a browser tab, and an error page from an API would be a dead
 * end with no way back to the portal.
 */
export function googleError(code: string | null, email: string | null): string | null {
  switch (code) {
    case 'cancelled':
      return 'You cancelled the Google sign-in. Nothing has changed.';
    case 'expired':
      return 'That sign-in took too long and expired. Press the button again.';
    case 'not_a_member':
      return `We could not find a membership for ${email ?? 'that Google account'}. If you `
        + 'have more than one Google account, try the other one, or sign in with the email '
        + 'you put on the membership form.';
    case 'failed':
      return 'We could not finish signing you in with Google. Try again, or use your email '
        + 'and password.';
    default:
      return null;
  }
}
