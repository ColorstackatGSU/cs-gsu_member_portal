import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="portal-pad">
      <div className="container-wide" style={{ maxWidth: 520, textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--gsu-red)',
          }}
        >
          404
        </p>
        <h1 style={{ marginTop: 12, fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>Page not found</h1>
        <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.6)' }}>
          That page doesn't exist, or it hasn't been built yet.
        </p>
        <Link to="/login" className="btn-primary" style={{ marginTop: 32 }}>
          Back to sign in
        </Link>
      </div>
    </section>
  );
}
