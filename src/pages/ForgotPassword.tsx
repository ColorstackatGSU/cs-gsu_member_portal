import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context';
import { passwordApi } from '../lib/member';
import { ApiError } from '../lib/api';
import Notice from '../components/Notice';

/**
 * Setting a password again. Same three steps as activation, and the same code by mail,
 * because a member should recognise the flow rather than learn a second one.
 *
 * Signing them straight in at the end is the point of doing it here rather than through
 * Supabase's hosted page: they finish where they started, already signed in.
 */

type Step = 'email' | 'code' | 'password' | 'done';

const STEPS: Step[] = ['email', 'code', 'password'];

function message(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Something went wrong. Try again in a moment.';
}

export default function ForgotPassword() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [sent, setSent] = useState<{ sentTo: string; remaining: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function request(resend = false) {
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      const result = await passwordApi.requestCode(email);
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
      await passwordApi.verifyCode(email, code);
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
      const account = await passwordApi.reset(email, code, password);
      // The account answers to the school address whichever one they typed, so signing in
      // with what they typed would fail right after a successful reset.
      try {
        await signIn(account.email, password);
        setStep('done');
      } catch {
        setError('Your password is set, but we could not sign you in. Use the sign in page.');
      }
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  }

  const heading = step === 'done' ? "You're back in" : 'Reset your password';

  const blurb = {
    email: 'Use the email you sign in with. School or personal, either works.',
    code: sent ? `We sent a 6-digit code to ${sent.sentTo}. It expires in 10 minutes.` : '',
    password: 'Pick a new password.',
    done: 'Your password is set and you are signed in.',
  }[step];

  return (
    <section className="auth-pad">
      <div className="container-wide" style={{ maxWidth: 470 }}>
        <div className="fade-in-up" style={{ position: 'relative', zIndex: 1 }}>
          <p className="section-eyebrow" style={{ marginBottom: 14 }}>
            {step === 'done' ? 'Welcome back' : `Step ${STEPS.indexOf(step) + 1} of ${STEPS.length}`}
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

              {error && (
                <Notice kind="error" style={{ marginTop: 16 }}>
                  {error}
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

              <p className="muted" style={{ marginTop: 16, fontSize: 12.5, textAlign: 'center' }}>
                {sent && sent.remaining > 0 ? (
                  <button type="button" className="link-button" disabled={busy} onClick={() => void request(true)}>
                    Send another code
                  </button>
                ) : (
                  'No codes left today.'
                )}
              </p>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={finish}>
              <label className="field-label" htmlFor="password">
                New password
              </label>
              <input
                id="password"
                type="password"
                className="field-input"
                autoComplete="new-password"
                autoFocus
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label className="field-label" htmlFor="confirm" style={{ marginTop: 16 }}>
                Again
              </label>
              <input
                id="confirm"
                type="password"
                className="field-input"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ marginTop: 20, width: '100%' }} disabled={busy}>
                {busy ? 'Setting...' : 'Set password'}
              </button>

              {error && (
                <Notice kind="error" style={{ marginTop: 16 }}>
                  {error}
                </Notice>
              )}
            </form>
          )}

          {step === 'done' && (
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={() => navigate('/dashboard', { replace: true })}
            >
              Go to my dashboard
            </button>
          )}
        </div>

        <p style={{ marginTop: 16, textAlign: 'center' }}>
          <Link to="/login" className="muted" style={{ fontSize: 13 }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
