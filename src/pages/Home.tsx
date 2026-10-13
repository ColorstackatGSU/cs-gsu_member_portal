import { Link } from 'react-router-dom';
import { useAuth } from '../auth/context';

/** Public entry point for people finding the portal through search or the chapter site. */
export default function Home() {
  const { session } = useAuth();

  return (
    <>
      <section className="home-hero">
        <div className="container-wide home-hero-grid">
          <div>
            <p className="section-eyebrow">ColorStack at Georgia State University</p>
            <h1>ColorStack at GSU member portal</h1>
            <p className="home-lede">
              Join the chapter, set up your account, and keep your member profile, resume,
              and event information in one place.
            </p>
            <div className="home-actions">
              <Link to="/join" className="btn-accent">Join the chapter</Link>
              <Link to={session ? '/dashboard' : '/login'} className="btn-secondary">
                {session ? 'Open my account' : 'Sign in'}
              </Link>
            </div>
          </div>
          <aside className="home-note" aria-label="Who can join">
            <span className="home-note-label">Membership</span>
            <strong>Open to every Georgia State student interested in tech.</strong>
            <span>Joining is free.</span>
          </aside>
        </div>
      </section>

      <section className="home-steps" aria-labelledby="home-steps-title">
        <div className="container-wide">
          <h2 id="home-steps-title">Get started</h2>
          <div className="home-step-grid">
            <div className="home-step">
              <span className="home-step-number">01</span>
              <h3>Join the chapter</h3>
              <p>Fill out the membership form to get on the chapter roster.</p>
              <Link to="/join">Membership form</Link>
            </div>
            <div className="home-step">
              <span className="home-step-number">02</span>
              <h3>Set up your account</h3>
              <p>Already joined? Use the code emailed to you to activate your account.</p>
              <Link to="/activate">Activate account</Link>
            </div>
            <div className="home-step">
              <span className="home-step-number">03</span>
              <h3>Use your portal</h3>
              <p>Sign in to update your profile, manage your resume, and see chapter events.</p>
              <Link to={session ? '/dashboard' : '/login'}>
                {session ? 'Open my account' : 'Sign in'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
