import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="portal-pad">
      <div className="container-wide" style={{ maxWidth: 560 }}>
        <div className="card fade-in-up" style={{ padding: '32px 28px' }}>
          <p
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--gsu-red)',
              margin: 0,
            }}
          >
            Error 404
          </p>
          {/* The number is the page. Nothing else here needs to be read twice. */}
          <p
            style={{
              margin: '10px 0 0',
              fontSize: 'clamp(72px, 18vw, 132px)',
              fontWeight: 900,
              letterSpacing: '-0.06em',
              lineHeight: 0.8,
            }}
          >
            404
          </p>
          <h1 className="page-title" style={{ marginTop: 18, fontSize: 'clamp(22px, 3.4vw, 30px)' }}>
            Page not found
          </h1>
          <p className="card-sub" style={{ marginTop: 12, fontSize: 14 }}>
            That page doesn't exist, or it hasn't been built yet.
          </p>
          <Link to="/dashboard" className="btn-primary" style={{ marginTop: 24 }}>
            Back to the portal
          </Link>
        </div>
      </div>
    </section>
  );
}
