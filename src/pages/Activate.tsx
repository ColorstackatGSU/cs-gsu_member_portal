import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context';
import { activationApi } from '../lib/member';
import { ApiError } from '../lib/api';
import Notice from '../components/Notice';

/**
 * Setting up an account, once. Email, then the code we mail, then a password.
 *
 * Every failure message comes from the API rather than being written here. The server
 * knows whether the address is a member, whether it is already claimed and how many codes
 * are left, and duplicating that wording client side guarantees the two drift apart.
 */

type Step = 'email' | 'code' | 'password' | 'done';

const STEPS: Step[] = ['email', 'code', 'password'];

function message(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Something went wrong. Try again in a moment.';
}

export default function Activate() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [sent, setSent] = useState<{ firstName: string | null; sentTo: string; remaining: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function request(resend = false) {
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      const result = await activationApi.requestCode(email);
      setSent(result);
      if (resend) {
        setCode('');
        setNote('We sent another code. It replaces the previous one.');
      } else {
        setStep('code');
      }
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      // Checked before the password step, so a mistyped code is caught while the email is
      // still open rather than after inventing a password.
      await activationApi.verifyCode(email, code);
      setStep('password');
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  }

  async function finish(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Those passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const account = await activationApi.claim(email, code, password);
      // Sign in with the address the account was created with, not the one they typed.
      // Members give two addresses and either may be used here, but Supabase only knows
      // the school one, so signing in with the personal one fails as a wrong password
      // moments after they chose it.
      try {
        // Sign them straight in: making someone who just chose a password type it again is
        // friction for no security.
        await signIn(account.email, password);
        setStep('done');
      } catch {
        // The account exists at this point, so retrying activation would only ever say it
        // is already set up. Sending them to sign in is the one thing that can still work.
        setError('Your account is ready, but we could not sign you in automatically. Use the sign in page.');
      }
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  }

  const heading =
    step === 'done'
      ? "You're all set"
      : step === 'password' && sent?.firstName
        ? `Almost there, ${sent.firstName}`
        : 'Set up your account';

  const blurb = {
    email: 'Use the email you put on the member interest form. Either the school one or the personal one works.',
    code: sent ? `We sent a 6-digit code to ${sent.sentTo}. It expires in 10 minutes.` : '',
    password: 'Pick a password. This is how you will sign in from now on.',
    done: 'Your account is ready and you are signed in.',
  }[step];

  return (
    <section className="auth-pad">
      <div className="container-wide" style={{ maxWidth: 470 }}>
        <div className="fade-in-up" style={{ position: 'relative', zIndex: 1 }}>
          <p className="section-eyebrow" style={{ marginBottom: 14 }}>
            {step === 'done' ? 'Welcome in' : `Step ${STEPS.indexOf(step) + 1} of ${STEPS.length}`}
          </p>
          <h1
            className="auth-heading"
            style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}
          >
            {heading}
          </h1>
          <p className="auth-sub" style={{ marginTop: 8, fontSize: 14 }}>
            {blurb}
          </p>
        </div>

        <div className="auth-card fade-in-up fade-delay-1" style={{ marginTop: 18 }}>
          {step === 'email' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void request();
              }}
            >
              <label className="field-label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="field-input"
                placeholder="you@student.gsu.edu"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ marginTop: 20, width: '100%' }} disabled={busy}>
                {busy ? 'Sending...' : 'Send my code'}
              </button>

              {error ? (
                <Notice kind="error" style={{ marginTop: 16 }}>
                  {error}
                </Notice>
              ) : (
                <Notice style={{ marginTop: 16 }}>
                  Have not filled the interest form yet? Do that first. Already did and still stuck?
                  Email{' '}
                  <a href="mailto:official@colorstackatgsu.com" style={{ textDecoration: 'underline' }}>
                    official@colorstackatgsu.com
                  </a>
                  .
                </Notice>
              )}
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={verify}>
              <label className="field-label" htmlFor="code">
                6-digit code
              </label>
              <input
                id="code"
                inputMode="numeric"
                maxLength={6}
                className="code-input"
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ marginTop: 20, width: '100%' }}
                disabled={busy || code.length !== 6}
              >
                {busy ? 'Checking...' : 'Verify'}
              </button>

              {error && (
                <Notice kind="error" style={{ marginTop: 16 }}>
                  {error}
                </Notice>
              )}
              {note && !error && <Notice style={{ marginTop: 16 }}>{note}</Notice>}

              <p className="muted" style={{ marginTop: 12, fontSize: 13, textAlign: 'center' }}>
                Didn't get it? Check spam, then{' '}
                <button
                  type="button"
                  onClick={() => void request(true)}
                  disabled={busy || sent?.remaining === 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    color: 'var(--gsu-blue)',
                    textDecoration: 'underline',
                    cursor: sent?.remaining === 0 ? 'not-allowed' : 'pointer',
                    opacity: sent?.remaining === 0 ? 0.5 : 1,
                  }}
                >
                  send another
                </button>
                {sent && ` (${sent.remaining} left today)`}
              </p>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={finish}>
              <label className="field-label" htmlFor="new-password">
                Choose a password
              </label>
              <input
                id="new-password"
                type="password"
                className="field-input"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                autoFocus
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <label className="field-label" htmlFor="confirm-password" style={{ marginTop: 16 }}>
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="field-input"
                placeholder="Type it again"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />

              <button type="submit" className="btn-primary" style={{ marginTop: 20, width: '100%' }} disabled={busy}>
                {busy ? 'Setting up...' : 'Create my account'}
              </button>

              {error && (
                <Notice kind="error" style={{ marginTop: 16 }}>
                  {error}
                </Notice>
              )}
            </form>
          )}

          {step === 'done' && (
            <>
              <Notice>
                All done. Next time, head straight to the sign in page and use your email and password.
              </Notice>
              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: 20, width: '100%' }}
                onClick={() => navigate('/dashboard')}
              >
                Go to my dashboard
              </button>
            </>
          )}
        </div>

        <p style={{ position: 'relative', zIndex: 1, marginTop: 14, textAlign: 'center' }}>
          <Link
            to="/login"
            style={{ fontSize: 13, color: 'var(--gsu-blue)', textDecoration: 'underline', fontWeight: 500 }}
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
