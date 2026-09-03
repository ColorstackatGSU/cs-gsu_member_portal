import { Link } from 'react-router-dom';
import LegalPage, { LEGAL_UPDATED } from '../components/LegalPage';

/**
 * Terms of service for the member portal, and the second link Google's consent screen asks
 * for.
 *
 * Kept short and kept true. A student chapter portal does not need indemnification clauses
 * and an arbitration venue; it needs to say who may use it, what we will do, what we will
 * not, and what happens if somebody misuses it. Everything longer than that would be
 * copied from somewhere else and would not describe this.
 */
export default function Terms() {
  return (
    <LegalPage title="Terms of service" eyebrow="Member Portal">
      <p className="legal-lede">
        These cover the ColorStack at GSU member portal at members.colorstackatgsu.com. Using
        it means you accept them.
      </p>
      <p className="legal-meta">Last updated {LEGAL_UPDATED}</p>

      <h2>Who can use it</h2>
      <p>
        Members of ColorStack at Georgia State University. You become one by filling in the
        membership form; the portal is where you manage what you gave us. Accounts are for
        one person, and you should not share yours.
      </p>

      <h2>What we do</h2>
      <ul>
        <li>Keep your member profile and your resume.</li>
        <li>Put your resume in the book we share with chapter sponsors.</li>
        <li>Email you about the chapter, your account, and events.</li>
        <li>Score your resume with an automated tool, if you ask for it.</li>
      </ul>

      <h2>What we ask of you</h2>
      <ul>
        <li>Give us information that is accurate, and keep it that way.</li>
        <li>Upload a resume that is yours.</li>
        <li>
          Do not try to reach anybody else's account or data, and do not try to break the
          portal. If you find a way to, please tell us instead of using it: write to{' '}
          <a href="mailto:official@colorstackatgsu.com">official@colorstackatgsu.com</a>.
        </li>
        <li>Follow GSU's student conduct rules, which apply here as anywhere else.</li>
      </ul>

      <h2>Your resume and sponsors</h2>
      <p>
        Uploading a resume puts it in the book we share with sponsoring companies. Remove it
        and it comes out of the book. The{' '}
        <Link to="/privacy">privacy policy</Link> says exactly what sponsors can and cannot
        see.
      </p>
      <p>
        We share it. What a sponsor does after that is between you and them, and we cannot
        promise anybody a job, an interview or a reply.
      </p>

      <h2>The resume score</h2>
      <p>
        It is a machine reading a PDF and guessing. It is there to be useful, not to be
        right, and it is not advice from the chapter or from anybody who hires.
      </p>

      <h2>What we do not promise</h2>
      <p>
        This is run by students, for free, alongside coursework. It will sometimes be down,
        and it may lose something. Keep your own copy of your resume. We provide the portal
        as it is, and we are not liable for what you lose by relying on it.
      </p>

      <h2>Ending it</h2>
      <p>
        You can ask us to delete your account whenever you like. We can suspend an account
        that is being used to harass people, break the portal, or misrepresent who somebody
        is, and for a serious enough reason we will do it without warning.
      </p>

      <h2>These terms changing</h2>
      <p>
        If we change something that matters, we will email members. Carrying on using the
        portal after that means you accept the change.
      </p>

      <h2>Not the university, and not ColorStack National</h2>
      <p>
        ColorStack at GSU is a registered student organization. It is not Georgia State
        University and not ColorStack Inc., and neither of them runs this portal or answers
        for it.
      </p>
    </LegalPage>
  );
}
