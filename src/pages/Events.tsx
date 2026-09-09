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
          <div className="card-head" style={{ flexWrap: 'wrap', gap: 12 }}>
            <h2 className="card-title">2026-2027 Events</h2>
            <a
              href="https://pin.gsu.edu/organization/colorstack"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                flex: 'none',
              }}
            >
              View all events ↗
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                  SHPE x ColorStack AI Ideathon
                </h3>
                <p className="card-sub" style={{ margin: 0 }}>
                  Collaboration Ideathon event with SHPE at GSU.
                </p>
              </div>
              <a 
                href="https://pin.gsu.edu/event/12716936"
                target="_blank"
                rel="noopener noreferrer"
                className="event-flyer"
                aria-label="View SHPE x ColorStack AI Ideathon on PIN"
              >
                <div className="event-flyer-media">
                  <img 
                    src="/images/shpe-colorstack-ideathon-flyer.png" 
                    alt="SHPE x ColorStack AI Ideathon Flyer" 
                    className="event-flyer-img"
                  />
                  <div className="event-flyer-overlay">
                    <span className="event-flyer-badge">
                      Link to PIN
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 17L17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            </div>

            <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                  Fall 2026 Kickoff
                </h3>
                <p className="card-sub" style={{ margin: 0 }}>
                  Are you smarter than a Software Engineer?
                </p>
              </div>
              <a 
                href="https://pin.gsu.edu/event/12618217"
                target="_blank"
                rel="noopener noreferrer"
                className="event-flyer"
                aria-label="View Fall 2026 Kickoff on PIN"
              >
                <div className="event-flyer-media">
                  <img 
                    src="/images/colorstack-fall-2026-kickoff-flyer.png" 
                    alt="ColorStack Fall 2026 Kickoff Flyer" 
                    className="event-flyer-img"
                  />
                  <div className="event-flyer-overlay">
                    <span className="event-flyer-badge">
                      Link to PIN
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 17L17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
