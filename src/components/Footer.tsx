import { Link } from 'react-router-dom';

const CONTACT_EMAIL = 'official@colorstackatgsu.com';

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
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        <span>ColorStack at Georgia State University</span>
        {/* Reachable from every signed-in page, not just by URL. A policy nobody can find
            is a policy nobody has read. */}
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </span>
      </div>
    </footer>
  );
}
