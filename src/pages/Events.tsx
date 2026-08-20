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
        <div className="fade-in-up">
          <p className="section-eyebrow" style={{ marginBottom: 12 }}>Member Portal</p>
          <h1 className="page-title">Events</h1>
        </div>

        <div className="card fade-in-up fade-delay-1" style={{ marginTop: 18 }}>
          <h2 className="card-title">Events coming soon</h2>
          <p className="card-sub" style={{ marginTop: 6 }}>
            Sign-ups will be here. For now, watch the Discord.
          </p>
        </div>
      </div>
    </section>
  );
}
