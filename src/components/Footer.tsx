const CONTACT_EMAIL = 'official@colorstackatgsu.com';

export default function Footer() {
  return (
    <footer
      className="portal-footer"
      style={{ borderTop: '1px solid var(--line)', padding: '32px 0', color: 'rgba(9, 16, 36, 0.65)' }}
    >
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
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--gsu-blue)' }}>
          {CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  );
}
