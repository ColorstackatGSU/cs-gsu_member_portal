import { Link } from 'react-router-dom';

const CONTACT_EMAIL = 'official@colorstackatgsu.com';
const SITE_URL = 'https://colorstackatgsu.com';

export default function Footer() {
  return (
    <footer className="portal-footer">
      <div
        className="container-wide"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--mono)',
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        <span>ColorStack at Georgia State University</span>
        {/* Reachable from every signed-in page, not just by URL. A policy nobody can find
            is a policy nobody has read. */}
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          {/* The way back to the chapter site. It used to be a button in the navbar,
              where it read as this portal's own navigation rather than as a door out of
              it — somebody halfway through joining does not know the main site is a
              different site. Down here it is unmistakably a footer link, which is where
              people look for one, and it is out of the way of anybody mid-task. */}
          <a href={SITE_URL} target="_blank" rel="noopener noreferrer">
            Main site
          </a>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </span>
      </div>
    </footer>
  );
}
