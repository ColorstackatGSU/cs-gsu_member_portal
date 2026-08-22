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
            <h2 className="card-title">Events coming soon</h2>
            <span className="pill pill-off">Not built</span>
          </div>
          <p className="card-sub" style={{ margin: 0 }}>
            Sign-ups will be here. For now, watch the Discord.
          </p>
        </div>
      </div>
    </section>
  );
}
