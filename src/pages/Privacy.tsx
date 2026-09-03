import LegalPage, { LEGAL_UPDATED } from '../components/LegalPage';

/**
 * The privacy policy, and the link Google's consent screen points at.
 *
 * Written from the schema rather than from a template. Every claim below is something the
 * code actually does, which is the only kind of privacy policy worth having: one that
 * describes a different system than the one running is worse than none, because it is a
 * promise nobody is keeping.
 *
 * It covers the member portal alone. The marketing site is a separate thing with separate
 * data, and folding both into one document would make this vaguer in exchange for nothing.
 */
export default function Privacy() {
  return (
    <LegalPage title="Privacy policy" eyebrow="Member Portal">
      <p className="legal-lede">
        This covers the ColorStack at GSU member portal at members.colorstackatgsu.com. It
        does not cover our public website, our Discord server, or anything ColorStack
        National runs.
      </p>
      <p className="legal-meta">Last updated {LEGAL_UPDATED}</p>

      <h2>Who we are</h2>
      <p>
        ColorStack at Georgia State University, a registered student organization. We are
        students, not a company. You can reach us at{' '}
        <a href="mailto:official@colorstackatgsu.com">official@colorstackatgsu.com</a>.
      </p>

      <h2>What we hold</h2>
      <p>Three things, from three places.</p>
      <ul>
        <li>
          <strong>What you put on the membership form.</strong> Your name, your GSU student
          email, a personal email, pronouns if you gave them, major, class year, expected
          graduation, LinkedIn, Discord username, any allergies you told us about for event
          catering, what you plan to do after graduating, and how interested you said you
          were in each of the things the chapter runs. We keep the raw form response as
          submitted.
        </li>
        <li>
          <strong>What you add in the portal.</strong> Your resume, a profile picture, a
          GitHub link, and edits to anything above.
        </li>
        <li>
          <strong>What happens when you use it.</strong> Sign-in records, the codes we mail
          you and when, whether you have signed in at all, and if you checked in at an event
          with a QR code, that you did and roughly when.
        </li>
      </ul>

      <h2>Your resume goes to sponsors</h2>
      <p>
        This is the part worth reading twice. <strong>Every member's resume is shared with
        the companies that sponsor the chapter.</strong> That is what the resume book is,
        and it is a large part of why sponsors fund us and why members join.
      </p>
      <p>
        Sponsors above a certain tier can see your name, major, class year, expected
        graduation, LinkedIn, and download your resume. They cannot see your email address,
        your Discord, your allergies, or how you answered the interest questions.
      </p>
      <p>
        There is no setting for this and we are not going to pretend there is one. If you do
        not want your resume in front of sponsors, delete it from the resume page and it is
        removed from the book. You stay a member either way, and you can put it back
        whenever you like.
      </p>

      <h2>Signing in with Google</h2>
      <p>
        If you choose "Continue with Google", Google tells us your email address, your name,
        and that Google has confirmed the address is yours. That is all we ask for and all
        we receive. We never see your Google password, and we cannot read your Gmail, your
        Drive, your contacts or your calendar.
      </p>
      <p>
        We use the address for exactly one thing: matching you to your membership so we can
        sign you in. If it does not match a membership, nothing is created and nothing is
        kept.
      </p>

      <h2>Who else sees any of it</h2>
      <ul>
        <li><strong>Chapter officers.</strong> All of it, to run the chapter.</li>
        <li><strong>Sponsors.</strong> Only the resume-book fields listed above.</li>
        <li>
          <strong>The services we run on.</strong> Supabase stores the database and files,
          Railway runs the server, Google Workspace sends our email and holds the form
          responses, and Google Gemini reads your resume if you ask for a resume score.
          They process it to provide those services and for nothing else.
        </li>
        <li>
          <strong>Discord</strong> sees your username if you link your account, so we can
          give you the member role.
        </li>
      </ul>
      <p>
        We do not sell your information, and we do not hand it to anyone else, including
        recruiters who are not sponsoring the chapter.
      </p>

      <h2>How long we keep it</h2>
      <p>
        For as long as you are a member and the chapter has a reason to keep it. Sign-in
        codes expire within the hour. Ask us to delete your account and we will, within a
        reasonable time, keeping only what we genuinely have to for the chapter's own
        records.
      </p>

      <h2>What you can do</h2>
      <ul>
        <li>Edit most of what we hold, yourself, on the profile page.</li>
        <li>Delete your resume or your profile picture at any time.</li>
        <li>Ask for a copy of everything we hold about you.</li>
        <li>Ask us to delete your account.</li>
      </ul>
      <p>
        For the last two, write to{' '}
        <a href="mailto:official@colorstackatgsu.com">official@colorstackatgsu.com</a>. A
        student organization is not a support desk, but we will get to it.
      </p>

      <h2>Keeping it safe</h2>
      <p>
        Resumes live in private storage and are only ever handed out as links that expire in
        minutes. The database enforces who can read what at the row level, so the rules do
        not depend on us remembering them in every screen. We are students running this in
        our spare time, though, so we are not going to claim it is impossible for anything
        to go wrong. If something does, we will tell the people affected.
      </p>

      <h2>Under 18</h2>
      <p>
        The portal is for enrolled GSU students. If you are under 13, do not use it. If you
        are between 13 and 18, ask a parent or guardian first.
      </p>

      <h2>Changes</h2>
      <p>
        If we change something that matters, we will email members rather than quietly
        editing this page and changing the date at the top.
      </p>
    </LegalPage>
  );
}
