import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { googleApi } from '../lib/google';
import { ApiError } from '../lib/api';
import Notice from '../components/Notice';

/**
 * Where Google sign-in lands, for the second or two it takes to turn a handoff code into a
 * session.
 *
 * The backend has already done the hard part: it checked Google's ID token and asked GoTrue
 * for a magic-link token for the member's address. What arrives here is a handoff code,
 * worth nothing on its own, which we swap once for that token and complete locally with
 * verifyOtp. That indirection is why the credential itself never appears in the address bar
 * or in browser history.
 *
 * Nothing on this screen is a decision. It either works, in which case the member is on
 * their dashboard before they have read anything, or it does not, in which case the only
 * useful thing to offer is the way back to sign in.
 */
export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [failure, setFailure] = useState<string | null>(null);
  // React 18 mounts effects twice in development, and a handoff is single use: the second
  // run would consume nothing and report a failed sign-in over a successful one.
  const started = useRef(false);

  const handoff = params.get('handoff');
  // Derived, not set in the effect: a missing parameter is a fact about the URL that is
  // known before anything runs, and writing it to state on mount is a cascading render.
  const error = failure
    ?? (handoff ? null : 'That sign-in link is incomplete. Start again from the sign in page.');

  useEffect(() => {
    if (!handoff || started.current) return;
    started.current = true;

    void (async () => {
      try {
        const session = await googleApi.claim(handoff);
        // supabase-js validates the hash with GoTrue, gets an access and refresh token
        // pair, and writes them to storage. AuthProvider's onAuthStateChange then updates
        // every consumer in the same frame, so the redirect below lands signed in.
        const { error: otpError } = await supabase.auth.verifyOtp({
          type: 'magiclink',
          token_hash: session.tokenHash,
        });
        if (otpError) throw otpError;

        // replace, not push: the handoff is spent, so leaving this URL in history gives a
        // Back button that lands on a sign-in that can never succeed again.
        navigate(session.activated ? '/dashboard?welcome=1' : '/dashboard', { replace: true });
      } catch (e: unknown) {
        setFailure(
          e instanceof ApiError
            ? e.message
            : 'We could not finish signing you in. Try again from the sign in page.',
        );
      }
    })();
  }, [handoff, navigate]);

  return (
    <section className="auth-pad">
      <div className="container-wide" style={{ maxWidth: 470 }}>
        <div className="fade-in-up auth-masthead">
          <p className="section-eyebrow">Member Portal</p>
          <h1
            className="auth-heading"
            style={{ fontSize: 'clamp(28px, 3.9vw, 40px)', fontWeight: 900, margin: 0 }}
          >
            {error ? 'Sign in failed' : 'Signing you in'}
          </h1>
        </div>

        <div className="auth-card fade-in-up fade-delay-1" style={{ marginTop: 18 }}>
          {error ? (
            <>
              <Notice kind="error">{error}</Notice>
              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: 16, width: '100%' }}
                onClick={() => navigate('/login', { replace: true })}
              >
                Back to sign in
              </button>
            </>
          ) : (
            <p className="muted" style={{ margin: 0 }}>
              One moment, finishing up with Google.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
