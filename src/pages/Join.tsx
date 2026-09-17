import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

/**
 * The membership form, on our own site.
 *
 * Joining used to mean leaving: the form lived on the main site, submitting it handed you
 * over to Google, and the account you now had was on a third domain you had never been
 * told about. Three hosts for one job. This page is the form where the account is, so the
 * whole thing happens in one tab.
 *
 * It is still Google's form in an iframe, deliberately. The officers work out of the
 * response spreadsheet, and a native form would take that away from them to buy a nicer
 * embed. The answers still reach the database the same way they always have: Apps Script
 * posts them to /intake/form-response, IntakeMapper turns question titles into columns,
 * and a code is mailed. Nothing about this page changes that.
 *
 * What the iframe costs us is knowing when they are finished. Google's form is on Google's
 * origin and sends no postMessage, so there is no supported way to be told the form was
 * submitted — and the onload trick that gets passed around does not distinguish a
 * submission from a page turn. So this page does not try to detect one. The next step is
 * written out below the frame, in full, from the moment the page opens, and it is correct
 * whether they read it before submitting or after.
 */

/**
 * Roughly how tall each page of the form is, in that order.
 *
 * The form is split into four sections, and they are nothing like the same length: the
 * first is a title and a Next button, the second is nine questions including a
 * fourteen-option radio. One height for all four means three quarters of the form sits
 * above a screenful of blank white, which is what a single fixed height actually looks
 * like in practice.
 *
 * We cannot measure the page — it is Google's origin and the same-origin policy stops us
 * reading anything inside the frame — but we are told each time the frame navigates, so we
 * can count which page they are probably on and size to that. Probably is the honest word:
 * pressing Back inside the form, or a validation error re-rendering a page, also counts.
 *
 * So the numbers are deliberately generous. Wrong in the tall direction is dead space for
 * a moment; wrong in the short direction is a scrollbar inside a scrollbar, which is the
 * thing this page exists to avoid. Anything past the end of the list gets the tallest
 * value rather than falling off it.
 */
const PAGE_HEIGHTS = ['620px', '2000px', '1400px', '1750px'];

/** Where the count lands once they submit, used only to brighten the card below. */
const FORM_PAGES = PAGE_HEIGHTS.length;

const FORM_SRC =
  'https://docs.google.com/forms/d/e/1FAIpQLSd-2WU1sCB8dM9ZOra_CRPvB0Ezo2iNC0_eNkKY-drlWg3MtA/viewform?embedded=true';

export default function Join() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Counts loads rather than storing a boolean, because the useful signal is how many
  // times the frame has navigated, and the first one is just the form arriving.
  const loads = useRef(0);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    function onLoad() {
      loads.current += 1;

      // The first load is the form appearing, which is not a page turn.
      if (loads.current === 1) return;

      // The actual fix for the worst of the embed. Pressing Next scrolls the frame's own
      // content back to its top, but the page around it stays exactly where it was, so on
      // a phone the next section starts somewhere above the viewport and the member is
      // left looking at the middle of a question they have not been asked yet. We cannot
      // read anything out of the frame, but we are told that it navigated, and that is
      // enough to put the top of the form back on screen.
      wrapRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });

      // Index, not count: the first load is page one.
      setPage(loads.current - 1);

      if (loads.current >= FORM_PAGES) {
        setReachedEnd(true);
      }
    }

    frame.addEventListener('load', onLoad);
    return () => frame.removeEventListener('load', onLoad);
  }, []);

  return (
    <>
      <section className="join-hero">
        <div className="container-wide" style={{ maxWidth: 760 }}>
          {/* A real button rather than an underlined line of text. This is the only way
              off a page whose entire middle is somebody else's iframe, and as a link on a
              blue field it read as part of the masthead's wording rather than as a control
              anybody could press. */}
          <Link to="/login" className="btn-secondary btn-sm join-back">
            &larr; Back to sign in
          </Link>
          <p className="section-eyebrow">Step 1 of 2</p>
          <h1>Join ColorStack at GSU</h1>
          <p>
            Open to every Georgia State student interested in tech, and free. Fill this in and we
            will put you on the roster, get you into the Discord, and email you a code for your
            member account.
          </p>
        </div>
      </section>

      <section className="join-body">
        {/* The height is set here rather than in the stylesheet because it changes as they
            move through the form. The stylesheet still owns the scale factor per
            breakpoint, so a phone gets the same page taller rather than a second set of
            numbers to keep in step. */}
        <div
          ref={wrapRef}
          className="form-embed-wrap"
          style={{ '--form-embed-page-h': PAGE_HEIGHTS[Math.min(page, FORM_PAGES - 1)] } as CSSProperties}
        >
          <iframe
            ref={frameRef}
            className="form-embed"
            src={FORM_SRC}
            title="ColorStack at GSU Member Form 2026/2027"
            /* Both frames' scrollbars are the problem this page exists to avoid, so the
               frame is sized never to need its own. Left scrollable rather than forced
               off: if a question is ever added and the height below is not retuned, a
               scrollbar is a nuisance, whereas an unreachable Submit button is a member
               who cannot join. */
            loading="eager"
          >
            Loading the membership form…
          </iframe>
        </div>

        {/* Below the frame rather than after the submission, because there is no
            submission to be after. Written so it reads correctly either way. */}
        <div className={reachedEnd ? 'join-next join-next-live' : 'join-next'}>
          <p className="section-eyebrow" style={{ marginBottom: 12 }}>
            Step 2 of 2 &middot; after you submit
          </p>
          <h2 style={{ margin: '0 0 14px', fontSize: 22, fontWeight: 900 }}>
            Set up your member account
          </h2>

          <ol className="join-steps">
            <li className="join-step">
              <span className="join-step-num">1</span>
              <span>
                Press <strong>Submit</strong> at the end of the form above.
              </span>
            </li>
            <li className="join-step">
              <span className="join-step-num">2</span>
              <span>
                Check your email. We send a 6-digit code straight away, to both addresses you
                gave us. Look in spam if it is not there in a minute.
              </span>
            </li>
            <li className="join-step">
              <span className="join-step-num">3</span>
              <span>
                Come back here and use the button below to finish setting up your account. That
                is what gets you the portal: your profile, the resume we share with sponsors, and
                what the chapter has coming up.
              </span>
            </li>
          </ol>

          <Link to="/activate" className="btn-primary" style={{ width: '100%' }}>
            I&rsquo;ve submitted the form &mdash; set up my account
          </Link>

          {/* The shortcut that skips the code entirely, mentioned here as well as on the
              activation page: Google asserting the address live is stronger proof than a
              code we mail to that same address, and it is one tap instead of six digits. */}
          <p className="muted" style={{ marginTop: 14, fontSize: 14, lineHeight: 1.5 }}>
            If the email you gave us is a Google account, choose <strong>Continue with Google</strong>{' '}
            on that page and you will not need the code at all.
          </p>

          <p className="muted" style={{ marginTop: 10, fontSize: 14 }}>
            Already set your account up?{' '}
            <Link to="/login" style={{ textDecoration: 'underline' }}>
              Sign in
            </Link>
            . Something gone wrong?{' '}
            <a href="mailto:official@colorstackatgsu.com" style={{ textDecoration: 'underline' }}>
              official@colorstackatgsu.com
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
