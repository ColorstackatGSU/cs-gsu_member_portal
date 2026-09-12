import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/context';
import Notice from '../components/Notice';

/**
 * The handoff that lets another site ask for your profile.
 *
 * A member clicking "Sign in with ColorStack at GSU" somewhere else lands on the API's
 * /oauth2/authorize, which has no idea who they are: the API is stateless and the session
 * lives here, in this app. So it sends them to this page, which proves who they are using
 * the session they already have, and sends them straight back.
 *
 * Nothing on this screen is a decision. The consent screen — which site, which fields —
 * comes after this, on the API, where the authorization actually happens. This is
 * plumbing, and the only thing a member should notice is that it was quick.
 *
 * Why a form POST rather than fetch(): the API's CORS policy does not allow credentialed
 * cross-origin requests, deliberately, because every other endpoint is bearer-token only
 * and a cookie-bearing XHR would undermine that. A top-level form navigation is not a
 * CORS request at all. The access token travels in the body, so it never lands in browser
 * history or a Referer header.
 */

export default function Authorize() {
  const [params] = useSearchParams();
  const location = useLocation();
  const { session, loading } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const state = params.get('state');
  const postTo = params.get('post_to');
  // The API sets this when it had nothing to resume — a stale tab, usually. Worth saying
  // plainly rather than bouncing the member somewhere with no explanation.
  const done = params.get('done');

  // Derived, not set in an effect: whether the URL carries what this page needs is a fact
  // about the URL, known before anything runs. Writing it to state on mount would be a
  // second render for something that was already decided.
  const error = sessionError
    ?? (done || (state && postTo)
        ? null
        : 'This page is part of signing into another site, and it was opened without the '
            + 'information it needs. Go back to that site and start again.');

  useEffect(() => {
    if (done || loading || !state || !postTo) return;

    void (async () => {
      // Read the token fresh rather than from context, so a token that refreshed in the
      // background is the one that gets sent.
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        setSessionError(
          'Your session has expired. Sign in again and retry from the other site.',
        );
        return;
      }
      setToken(accessToken);
    })();
  }, [done, loading, session, state, postTo]);

  // Submitted from an effect rather than from the token setter, so React has already
  // rendered the hidden input by the time the form goes. Guarded because a double submit
  // would spend the one-time state and fail the second time.
  useEffect(() => {
    if (token && !submitted.current && formRef.current) {
      submitted.current = true;
      formRef.current.submit();
    }
  }, [token]);

  // Not signed in: to the login page, remembering the whole URL rather than just the
  // path. RequireAuth's own `from` keeps only location.pathname, which would be fine for
  // every other route in this app and would silently drop the state and post_to this page
  // cannot work without.
  if (!done && !loading && !session) {
    return (
      <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
    );
  }

  if (done) {
    return (
      <section className="portal-pad">
        <div className="container-wide" style={{ maxWidth: 520, display: 'grid', gap: 16 }}>
          <h1 className="page-title">Nothing to continue</h1>
          <p className="muted" style={{ lineHeight: 1.55 }}>
            You are signed in, but the sign-in request that brought you here has expired.
            Go back to the site you were signing into and click the button again.
          </p>
          <a className="btn-primary" href="/dashboard" style={{ justifySelf: 'start' }}>
            Go to my dashboard
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="portal-pad">
      <div className="container-wide" style={{ maxWidth: 520, display: 'grid', gap: 16 }}>
        {error ? (
          <>
            <h1 className="page-title">That link is incomplete</h1>
            <Notice kind="error">{error}</Notice>
            <a className="btn-secondary" href="/dashboard" style={{ justifySelf: 'start' }}>
              Go to my dashboard
            </a>
          </>
        ) : (
          <>
            <h1 className="page-title">One moment</h1>
            <p className="muted" style={{ lineHeight: 1.55 }}>
              Taking you back to finish signing in.
            </p>
            <div className="skeleton" style={{ height: 120 }} />
          </>
        )}

        {/* Rendered only once there is something to send. Submitting happens in the
            effect above; there is no button because there is no decision here. */}
        {token && state && postTo && (
          <form ref={formRef} method="POST" action={postTo} style={{ display: 'none' }}>
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="state" value={state} />
          </form>
        )}
      </div>
    </section>
  );
}
