import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/context';
import { activationApi } from '../lib/member';
import { ApiError } from '../lib/api';
import Notice from '../components/Notice';
import GoogleButton from '../components/GoogleButton';

/**
 * Setting up an account, once. Email, then the code we mail, then a password.
 *
 * There are two ways in, and the second one is not a convenience. Most people arrive here
 * already holding a code, because submitting the intake form mails one immediately. For
 * them the first step is not just redundant, it is destructive: asking for a code issues a
 * new one and invalidates the one in their hand, so the code they were carefully typing in
 * from the email had been dead since before they opened the page. They then burn a second
 * of three daily codes discovering that.
 *
 * So an ?email= parameter, which is what the code email links to, starts at the code box
 * and sends nothing. "I already have a code" does the same for anybody who found this page
 * on their own.
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
  const [searchParams] = useSearchParams();

  // Read once, as initial state rather than in an effect: arriving from the email means
  // starting at the code box, and a redirect after the first paint would flash the very
  // screen we are trying to keep people away from.
  const linkedEmail = searchParams.get('email')?.trim() ?? '';

  const [step, setStep] = useState<Step>(linkedEmail ? 'code' : 'email');
  const [email, setEmail] = useState(linkedEmail);
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
    email: 'Use the email you put on the membership form. School or personal, either works.',
    // Two different situations. We sent one just now, or they already had one and came
    // straight here, in which case claiming we just sent something would be a lie and
    // would also stop them looking at the older email that actually has their code.
    code: sent
      ? `We sent a 6-digit code to ${sent.sentTo}.`
      // Names the address, because this is the branch where nobody chose it on this
      // screen: it came out of a link, and a wrong one otherwise fails at Verify with
      // nothing on the page explaining which address was even being checked.
      : `Enter the 6-digit code we emailed to ${email}.`,
    password: 'Pick a password. This is how you will sign in from now on.',
    done: 'Your account is ready and you are signed in.',
  }[step];

  return (
    <section className="auth-pad">
      <div className="container-wide" style={{ maxWidth: 470 }}>
        <div className="fade-in-up auth-masthead">
          <p className="section-eyebrow">
            {step === 'done' ? 'Welcome in' : `Step ${STEPS.indexOf(step) + 1} of ${STEPS.length}`}
          </p>
          <h1
            className="auth-heading"
            style={{ fontSize: 'clamp(28px, 3.9vw, 40px)', fontWeight: 900, margin: 0 }}
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
              {/* The shortcut past this whole screen. Google asserting the address live is
                  stronger proof than a code we mail to that same address, so signing in
                  this way activates the account outright and skips the code entirely. */}
              <GoogleButton label="Activate with Google" />
              <div className="divider-or">or use a code</div>

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
              <button type="submit" className="btn-primary" style={{ marginTop: 20, width: '100%' }} disabled={busy}>
                {busy ? 'Sending...' : 'Send my code'}
              </button>

              {/* The way out for somebody who submitted the form, was mailed a code, and
                  found this page on their own. Without it the only route forward issues a
                  new code and kills theirs. Sends nothing: it just moves to the box. */}
              <p className="muted" style={{ marginTop: 12, fontSize: 13, textAlign: 'center' }}>
                Already got a code from us?{' '}
                <button
                  type="button"
                  onClick={() => {
                    if (!email.trim()) {
                      // verify-code is checked against an address, so we cannot skip ahead
                      // without one. Says what to do rather than just refusing.
                      setError('Put your email in first, then we can check your code.');
                      return;
                    }
                    setError(null);
                    setNote(null);
                    setStep('code');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    color: 'var(--gsu-blue)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  enter it instead
                </button>
              </p>

              {error ? (
                <Notice kind="error" style={{ marginTop: 16 }}>
                  {error}
                </Notice>
              ) : (
                <Notice style={{ marginTop: 16 }}>
                  Not filled the{' '}
                  <a
                    href="https://forms.gle/GaMnRiAadtNspBr86"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline' }}
                  >
                    membership form
                  </a>{' '}
                  yet? Start there. Stuck? Email{' '}
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

              {!sent && (
                <p className="muted" style={{ marginTop: 12, fontSize: 13, textAlign: 'center' }}>
                  Not your address?{' '}
                  <button
                    type="button"
                    onClick={() => { setError(null); setNote(null); setCode(''); setStep('email'); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      font: 'inherit',
                      color: 'var(--gsu-blue)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    start again
                  </button>
                </p>
              )}

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

        <p style={{ position: 'relative', zIndex: 1, marginTop: 16, textAlign: 'center' }}>
          {/* Sits on the mosaic rather than in the card, so it needs its own weight. */}
          <Link
            to="/login"
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            &larr; Back to sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
