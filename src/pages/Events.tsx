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
                fontSize: 12,
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                  GSU Tech Clubs - Resume Workshop
                </h3>
                <p className="card-sub" style={{ margin: 0 }}>
                  Get the ins and outs of perfecting your resume and standing out to recruiters.
                </p>
              </div>
              <a 
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="event-flyer"
                aria-label="View GSU Tech Clubs - Resume Workshop on PIN"
              >
                <div className="event-flyer-media">
                  <img 
                    src="/images/resume_workshop_1_2026.png" 
                    alt="GSU Tech Clubs - Resume Workshop" 
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

            <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                  Equifax X Colorstack & CS Club
                </h3>
                <p className="card-sub" style={{ margin: 0 }}>
                  An event built to introduce students to Equifax, Technical Career Paths, and 2027 Internship and Rotational Opportunities.
                </p>
              </div>
              <a 
                href="https://pin.gsu.edu/event/12793088"
                target="_blank"
                rel="noopener noreferrer"
                className="event-flyer"
                aria-label="View Equifax X Colorstack & CS Club on PIN"
              >
                <div className="event-flyer-media">
                  <img 
                    src="/images/equifax_colorstack.png" 
                    alt="Equifax x ColorStack Panel Flyer" 
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                  CS Club X progsu X ColorStack Tech League
                </h3>
                <p className="card-sub" style={{ margin: 0 }}>
                  A semester-long, team-based competition. Teams of 3-4 tackle 5 milestones, rack up points pn the leaderboard, and finish with a Capstone Hackathon.
                </p>
              </div>
              <a 
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="event-flyer"
                aria-label="View CS Club X progsu X ColorStack Tech League"
              >
                <div className="event-flyer-media">
                  <img 
                    src="/images/tech_league_3.jpg" 
                    alt="CS Club X progsu X ColorStack Tech League" 
                    className="event-flyer-img"
                  />
                  <div className="event-flyer-overlay">
                    <span className="event-flyer-badge">
                      To Be Announced
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
{/* 
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                  ColorStack X NVIDIA
                </h3>
                <p className="card-sub" style={{ margin: 0 }}>
                  Explore the future of technology and hear from an NVIDIA engineering leader about the innovation shaping our industry..
                </p>
              </div>
              <a 
                href="https://pin.gsu.edu/event/12793269"
                target="_blank"
                rel="noopener noreferrer"
                className="event-flyer"
                aria-label="View ColorStack X NVIDIA on PIN"
              >
                <div className="event-flyer-media">
                  <img 
                    src="/images/colorstackxnvidia_placeholder.png" 
                    alt="ColorStack X NVIDIA Flyer" 
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
          </div> */}

            </div>
          </div>
        </div>
    </section>
  );
}
