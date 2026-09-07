import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/context';
import { authApi } from '../lib/member';
import Notice from '../components/Notice';
import GoogleButton from '../components/GoogleButton';
import { googleError } from '../lib/google';

/**
 * The everyday path: email and password, no code.
 *
 * A code is mailed once, when they claim their account (see Activate.tsx). Routine logins
 * never send email, which is what keeps the sending quota clear.
 *
 * Sign in goes straight to Supabase rather than through our API. Supabase issues the
 * token; everything after this point sends that token to Spring, which is where all the
 * data lives. That split is deliberate and is the same one the sponsor portal uses.
 *
 * Sized to fit one viewport without scrolling. Adding fields here means taking height
 * back somewhere else.
 */
export default function Login() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // The password form is one tap behind the three choices rather than the default view.
  const [showPassword, setShowPassword] = useState(false);

  // A failed Google sign-in comes back as a redirect with a reason on it, because the
  // person is mid-flow in a browser tab and the backend has nowhere else to tell them.
  // Read here rather than stored, so it clears the moment they try anything else.
  const oauthProblem = googleError(params.get('oauth'), params.get('email'));

  // Where they were headed before the guard bounced them here, so signing in resumes
  // that rather than always landing on the dashboard.
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  if (session) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      // Either address on the form works. Supabase only knows the school one, so the
      // personal one is resolved to it first.
      const { email: resolved } = await authApi.resolveEmail(email).catch(() => ({ email }));
      await signIn(resolved, password);
      navigate(from, { replace: true });
    } catch {
      // Supabase answers "Invalid login credentials" for a wrong password and for an
      // address with no account alike, and that is the right behaviour to keep: telling
      // a stranger which of the two it was turns this form into a membership checker.
      setError('That email and password do not match. Check them and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-pad">
      <div className="container-wide" style={{ maxWidth: 470 }}>
        <div className="fade-in-up auth-masthead">
          <p className="section-eyebrow">Member Portal</p>
          <h1
            className="auth-heading"
            style={{ fontSize: 'clamp(32px, 4.4vw, 46px)', fontWeight: 900, margin: 0 }}
          >
            Sign in
          </h1>
          <p className="auth-sub" style={{ marginTop: 8, fontSize: 14 }}>
            Welcome back.
          </p>
        </div>

        <div className="auth-card fade-in-up fade-delay-1" style={{ marginTop: 18 }}>
          {/* Three doors, one visible choice each.
              This used to be a password form with Google bolted above it and activation
              bolted below, so the first thing a member saw was two text inputs whether or
              not they were the person those inputs were for. Most are not: they either
              have a Google account, or they have never set a password at all. The form
              is still here, one tap in, for the people it belongs to. */}
          {!showPassword ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <GoogleButton label="Sign in with Google" />

              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%' }}
                onClick={() => setShowPassword(true)}
              >
                Sign in with password
              </button>

              <Link to="/activate" className="btn-secondary" style={{ width: '100%' }}>
                Activate account
              </Link>

              {(error || oauthProblem) && (
                <Notice kind="error" style={{ marginTop: 6 }}>
                  <div>{error ?? oauthProblem}</div>
                  <div style={{ marginTop: 6, fontSize: 12.5 }}>
                    First time here? Make sure to{' '}
                    <Link to="/activate" style={{ fontWeight: 700, textDecoration: 'underline' }}>
                      activate your account first
                    </Link>
                    .
                  </div>
                </Notice>
              )}

              <p
                className="muted auth-fineprint"
                style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.5, textAlign: 'center' }}
              >
                New here? Fill out the{' '}
                <a
                  href="https://forms.gle/GaMnRiAadtNspBr86"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline' }}
                >
                  member form
                </a>{' '}
                first, then activate.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <label className="field-label" htmlFor="email">
                Personal or school email
              </label>
              <input
                id="email"
                type="email"
                className="field-input"
                placeholder="Enter your email address"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label className="field-label" htmlFor="password" style={{ marginTop: 16 }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                className="field-input"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <p style={{ marginTop: 10, textAlign: 'right' }}>
                <Link to="/forgot" className="muted" style={{ fontSize: 12.5 }}>
                  Forgot your password?
                </Link>
              </p>

              <button
                type="submit"
                className="btn-primary"
                style={{ marginTop: 14, width: '100%' }}
                disabled={busy}
              >
                {busy ? 'Signing in...' : 'Sign in'}
              </button>

              {error && (
                <Notice kind="error" style={{ marginTop: 16 }}>
                  <div>{error}</div>
                  <div style={{ marginTop: 6, fontSize: 12.5 }}>
                    First time here? Make sure to{' '}
                    <Link to="/activate" style={{ fontWeight: 700, textDecoration: 'underline' }}>
                      activate your account first
                    </Link>
                    .
                  </div>
                </Notice>
              )}

              <button
                type="button"
                className="btn-secondary btn-sm"
                style={{ marginTop: 12, width: '100%' }}
                onClick={() => { setShowPassword(false); setError(null); }}
              >
                Back
              </button>
            </form>
          )}

          <p
            className="muted auth-fineprint"
            style={{ marginTop: 14, fontSize: 11.5, textAlign: 'center' }}
          >
            <Link to="/privacy" style={{ textDecoration: 'underline' }}>Privacy policy</Link>
            {' · '}
            <Link to="/terms" style={{ textDecoration: 'underline' }}>Terms</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
