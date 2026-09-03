import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * The shell the privacy policy and terms share.
 *
 * They are the only long-form reading in the portal, so they get a plain white column at a
 * comfortable measure rather than the card-on-mosaic treatment the rest of the signed-out
 * app uses. A wall of legal text over a wall of photographs is unreadable, and these two
 * pages are the ones that most need to be read.
 *
 * Public and unauthenticated on purpose: Google's consent screen links to them, so they
 * have to render for somebody who has never signed in and never will.
 */

/** One date for both pages, so they cannot drift and disagree about when they changed. */
export const LEGAL_UPDATED = 'September 3, 2026';

export default function LegalPage({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  // These are linked to from outside the app, so somebody often arrives here mid-scroll
  // from a browser restoring a position that means nothing on a page they have not read.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <section className="legal-pad">
      <div className="legal-column">
        <p className="section-eyebrow">{eyebrow}</p>
        <h1 className="legal-title">{title}</h1>

        <div className="legal-body">{children}</div>

        <div className="legal-foot">
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms of service</Link>
          <a href="mailto:official@colorstackatgsu.com">official@colorstackatgsu.com</a>
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </section>
  );
}
