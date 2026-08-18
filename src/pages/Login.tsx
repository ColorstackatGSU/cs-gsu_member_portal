import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context';
import { authApi } from '../lib/member';
import Notice from '../components/Notice';

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Where they were headed before the guard bounced them here, so signing in resumes
  // that rather than always landing on the profile.
  const from = (location.state as { from?: string } | null)?.from ?? '/profile';

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
        <div className="fade-in-up" style={{ position: 'relative', zIndex: 1 }}>
          <p className="section-eyebrow" style={{ marginBottom: 14 }}>
            Member Portal
          </p>
          <h1
            className="auth-heading"
            style={{ fontSize: 'clamp(28px, 3.6vw, 38px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}
          >
            Sign in
          </h1>
          <p className="auth-sub" style={{ marginTop: 8, fontSize: 14 }}>
            Welcome back. Use the email and password you set up.
          </p>
        </div>

        <form className="auth-card fade-in-up fade-delay-1" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <label className="field-label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            className="field-input"
            placeholder="you@student.gsu.edu"
            autoComplete="email"
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

          <button type="submit" className="btn-primary" style={{ marginTop: 20, width: '100%' }} disabled={busy}>
            {busy ? 'Signing in...' : 'Sign in'}
          </button>

          {error && (
            <Notice kind="error" style={{ marginTop: 16 }}>
              {error}
            </Notice>
          )}

          <div className="divider-or">First time here?</div>

          <Link to="/activate" className="btn-secondary" style={{ width: '100%' }}>
            Activate your account
          </Link>

          <p
            className="muted auth-fineprint"
            style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.5, textAlign: 'center' }}
          >
            Fill out the member form first. We'll email you a one-time code, then you pick a password.
          </p>
        </form>
      </div>
    </section>
  );
}
