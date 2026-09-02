import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError } from '../lib/api';
import { fairApi, type FairEvent, type FairSignUp } from '../lib/fair';
import Notice from '../components/Notice';

/**
 * The page behind the QR code on the tabling cloth.
 *
 * Written for a phone held in one hand by somebody standing in a queue in the sun, which
 * drove most of the decisions here. Four fields and nothing else. No account, no login, no
 * explanation of what a member portal is — the whole pitch is "put your name in, we will
 * email you the form". A visitor who has to read a paragraph before typing has already
 * walked to the next table.
 *
 * It is deliberately NOT the membership form. Asking for a major and a graduation semester
 * and six interest ratings at a folding table is how you get thirty abandoned submissions;
 * the form arrives by email, with these four answers already in it, and gets filled in
 * that evening on a laptop.
 *
 * The confirmation is the other half of the job and is not decoration. An officer needs to
 * see, across a table, that this person is done — so the success state is a full screen
 * with a drawn check, their name and the time, big enough to read at arm's length.
 */

type Stage = 'form' | 'done';

function message(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Something went wrong. Try again in a moment.';
}

export default function InvolvementFair() {
  const [event, setEvent] = useState<FairEvent | null>(null);
  const [stage, setStage] = useState<Stage>('form');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  // The honeypot. Hidden from people and from screen readers, so anything in it came from
  // something filling every input on the page.
  const [company, setCompany] = useState('');
  const [result, setResult] = useState<FairSignUp | null>(null);
  const [markedAt, setMarkedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // The event name comes from the server so a new event is an environment variable rather
  // than a redeploy of this app. A failure here is silent on purpose: the heading falls
  // back to something generic, and nobody at a table cares that a title is less specific
  // than it could have been.
  useEffect(() => {
    let cancelled = false;
    fairApi
      .event()
      .then((info) => { if (!cancelled) setEvent(info); })
      .catch(() => { /* generic heading is fine */ });
    return () => { cancelled = true; };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const signUp = await fairApi.signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        studentEmail: studentEmail.trim(),
        company,
      });
      setResult(signUp);
      // Stamped in the browser rather than read off the response: this is the time the
      // person is showing an officer, and it should match the phone in their hand.
      setMarkedAt(new Date());
      setStage('done');
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  }

  /** Hands the phone back to the next person in the queue. */
  function reset() {
    setStage('form');
    setResult(null);
    setMarkedAt(null);
    setError(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setStudentEmail('');
  }

  const eventName = event?.eventName ?? 'ColorStack at GSU';
  const domainHint = event?.studentEmailDomain
    ? `Your ${event.studentEmailDomain} address.`
    : 'Your school address.';

  if (stage === 'done' && result) {
    return <Marked result={result} at={markedAt} onAnother={reset} />;
  }

  return (
    <section className="auth-pad">
      <div className="container-wide" style={{ maxWidth: 470 }}>
        <div className="fade-in-up auth-masthead">
          <p className="section-eyebrow">{eventName}</p>
          <h1
            className="auth-heading"
            style={{ fontSize: 'clamp(28px, 3.9vw, 40px)', fontWeight: 900, margin: 0 }}
          >
            Say hello
          </h1>
          <p className="auth-sub" style={{ marginTop: 8, fontSize: 14 }}>
            Four boxes and you are on the list. We will email you the membership form with
            these already filled in.
          </p>
        </div>

        <div className="auth-card fade-in-up fade-delay-1" style={{ marginTop: 18 }}>
          <form onSubmit={submit}>
            {/* Two up on anything but the narrowest phone: given and family name are one
                thought and stacking them makes the form look twice as long as it is. */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="field-label" htmlFor="fair-first">First name</label>
                <input
                  id="fair-first"
                  className="field-input"
                  autoComplete="given-name"
                  autoFocus
                  required
                  maxLength={80}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="fair-last">Last name</label>
                <input
                  id="fair-last"
                  className="field-input"
                  autoComplete="family-name"
                  required
                  maxLength={80}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label className="field-label" htmlFor="fair-student">Student email</label>
              <input
                id="fair-student"
                type="email"
                className="field-input"
                placeholder="you@student.gsu.edu"
                autoComplete="email"
                inputMode="email"
                required
                maxLength={254}
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />
              <p className="muted" style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.45 }}>
                {domainHint}
              </p>
            </div>

            <div style={{ marginTop: 14 }}>
              <label className="field-label" htmlFor="fair-email">Personal email</label>
              <input
                id="fair-email"
                type="email"
                className="field-input"
                placeholder="you@gmail.com"
                inputMode="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="muted" style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.45 }}>
                We will email both addresses.
              </p>
            </div>

            {/* Off-screen rather than display:none — some bots skip anything hidden, and
                aria-hidden plus tabIndex keeps it away from screen readers and the tab
                order without that tell. */}
            <div
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
            >
              <label htmlFor="fair-company">Company</label>
              <input
                id="fair-company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ marginTop: 20, width: '100%' }}
              disabled={busy}
            >
              {busy ? 'Marking you in...' : "I'm here"}
            </button>

            {error && (
              <Notice kind="error" style={{ marginTop: 16 }}>
                {error}
              </Notice>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   The confirmation
   ==========================================================================*/

/**
 * What the attendee holds up to an officer.
 *
 * The check draws itself: the circle sweeps, then the tick strokes on, then the plate
 * settles. It is doing a real job rather than being flourish — an animation that plays
 * once is proof this screen was just produced, where a static tick could be a screenshot
 * or a page left open from an hour ago.
 *
 * Everything an officer needs to read at arm's length is above the fold: the word, the
 * name, and the time. The links are for the attendee afterwards.
 */
function Marked({
  result,
  at,
  onAnother,
}: {
  result: FairSignUp;
  at: Date | null;
  onAnother: () => void;
}) {
  const name = result.firstName?.trim();
  const time = (at ?? new Date()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // The four people who reach this screen need four different next steps. The backend
  // decides which of them this is; see FairService for how and why.
  const next = {
    new: {
      lead: 'Check your email for the membership form.',
      cta: 'Open the form now',
    },
    unclaimed: {
      lead: 'You have already filled in the form, so all that is left is a password.',
      cta: 'Set up my account',
    },
    member: {
      lead: 'You are already a member with an account set up. Nothing to do.',
      cta: 'Open the member portal',
    },
    // The only one of the four that asks for something. It says what the resume is for,
    // because "upload your resume" on its own reads as admin, and sponsors reading it is
    // the entire reason to bother.
    member_no_resume: {
      lead: 'You are already a member, but you have not uploaded a resume yet. That is the '
        + 'part sponsors see, and members without one are not in the resume book.',
      cta: 'Upload my resume',
    },
  }[result.audience];

  return (
    <section className="auth-pad">
      <div className="container-wide" style={{ maxWidth: 470 }}>
        <div className="fair-marked">
          <FairMark />

          <p className="section-eyebrow" style={{ marginBottom: 10 }}>{result.eventName}</p>
          <h1 className="auth-heading fair-marked-title">
            Attendance
            <br />
            marked
          </h1>

          {name && <p className="fair-marked-name">{name}</p>}
          <p className="fair-marked-time">Checked in at {time}</p>
        </div>

        <div className="auth-card fade-in-up fade-delay-2" style={{ marginTop: 16 }}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{next.lead}</p>

          {result.emailed ? (
            <p className="muted" style={{ fontSize: 13.5, marginTop: 8, lineHeight: 1.5 }}>
              Sent to {result.sentTo}. Give it a minute, and check spam.
            </p>
          ) : (
            <p className="muted" style={{ fontSize: 13.5, marginTop: 8, lineHeight: 1.5 }}>
              We have you on the list. If no email turns up, use the button below. It is
              the same link.
            </p>
          )}

          {result.formUrl && (
            <a
              className="btn-primary"
              href={result.formUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 18,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
              }}
            >
              {next.cta}
            </a>
          )}

          {/* One phone gets passed down a queue of six people. Without this the next
              person is looking at somebody else's confirmation and has to know to
              reload. */}
          <button
            type="button"
            className="btn-secondary"
            style={{ marginTop: 10, width: '100%' }}
            onClick={onAnother}
          >
            Sign someone else in
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * A check that draws itself, spins, and lands as the chapter logo.
 *
 * Two layers stacked in the same box rather than one morphing shape: the check is inline
 * SVG, because stroke-dashoffset is the whole trick and a dependency for one tick is a bad
 * trade, and the logo is the real asset, because it is the chapter's mark and nobody
 * should be looking at a hand-redrawn near-miss of it. The handoff is a shared rotation —
 * the check leaves clockwise and the logo arrives out of the same spin — which is what
 * makes it read as one thing turning into another rather than a crossfade.
 *
 * The timing lives in index.css. Reduced motion gets the logo, already landed.
 */
function FairMark() {
  return (
    <div className="fair-mark" role="img" aria-label="Attendance marked">
      <svg className="fair-check" viewBox="0 0 120 120" aria-hidden="true">
        <circle className="fair-check-ring" cx="60" cy="60" r="52" />
        <path className="fair-check-tick" d="M36 62 L53 79 L85 44" />
      </svg>
      <img className="fair-logo" src="/images/colorstack-gsu-logo.png" alt="" aria-hidden="true" />
    </div>
  );
}
