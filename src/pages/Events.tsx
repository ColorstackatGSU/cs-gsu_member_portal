/**
 * A placeholder with a route, so the nav item is real rather than decorative.
 *
 * Events are the reason most members joined the chapter, and this is where sign-ups will
 * live once the tables exist.
 */
export default function Events() {
  return (
    <section className="portal-pad">
      <div className="container-wide" style={{ maxWidth: 820 }}>
        <div className="fade-in-up page-head">
          <p className="section-eyebrow" style={{ marginBottom: 12 }}>Member Portal</p>
          <h1 className="page-title">Events</h1>
        </div>

        <div className="card fade-in-up fade-delay-1">
          <div className="card-head">
            <h2 className="card-title">Upcoming Events</h2>
            <span className="pill pill-active">1 Active</span>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                Fall 2026 Kickoff
              </h3>
              <p className="card-sub" style={{ margin: 0 }}>
                Join us for the ColorStack at GSU Fall 2026 Kickoff! Watch the Discord for details and updates.
              </p>
            </div>
            <div style={{ maxWidth: 280, border: '2px solid var(--ink)', background: 'var(--paper-2)', padding: 8 }}>
              <img 
                src="/images/colorstack-fall-2026-kickoff-flyer.png" 
                alt="ColorStack Fall 2026 Kickoff Flyer" 
                style={{ width: '100%', height: 'auto', display: 'block', border: '1px solid var(--ink)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
