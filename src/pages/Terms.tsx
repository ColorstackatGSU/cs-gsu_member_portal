import { Link } from 'react-router-dom';
import LegalPage, { LEGAL_UPDATED } from '../components/LegalPage';

/**
 * Terms of service, and the second link Google's consent screen asks for.
 *
 * Plain, standard register, same as the privacy policy. Short because the portal is small,
 * but every clause here describes something that is actually true of it.
 */
export default function Terms() {
  return (
    <LegalPage title="Terms of service" eyebrow="Member Portal">
      <p className="legal-lede">
        These terms govern your use of the ColorStack at GSU member portal at
        members.colorstackatgsu.com. By using the portal, you agree to them.
      </p>
      <p className="legal-meta">Last updated {LEGAL_UPDATED}</p>

      <h2>1. Eligibility</h2>
      <p>
        The portal is available to members of ColorStack at Georgia State University.
        Membership begins when you submit the chapter membership form. Accounts are personal
        to you and must not be shared or transferred.
      </p>

      <h2>2. The service</h2>
      <p>Through the portal we:</p>
      <ul>
        <li>maintain your member profile and your resume;</li>
        <li>
          include your resume and contact information in the resume book made available to
          chapter sponsors;
        </li>
        <li>send you email about your account, chapter events and chapter programming; and</li>
        <li>provide an automated resume assessment, at your request.</li>
      </ul>

      <h2>3. Your responsibilities</h2>
      <ul>
        <li>Provide accurate information and keep it current.</li>
        <li>Upload only a resume that is your own.</li>
        <li>
          Do not attempt to access another member's account or information, and do not
          attempt to disrupt or circumvent the portal's security. If you discover a
          vulnerability, report it to{' '}
          <a href="mailto:official@colorstackatgsu.com">official@colorstackatgsu.com</a>{' '}
          rather than exploiting it.
        </li>
        <li>Comply with the Georgia State University Student Code of Conduct.</li>
      </ul>

      <h2>4. Resume book and sponsors</h2>
      <p>
        Uploading a resume includes it in the resume book made available to sponsoring
        companies, together with the information listed in our{' '}
        <Link to="/privacy">privacy policy</Link>. Deleting your resume removes it from the
        resume book.
      </p>
      <p>
        Sponsors may contact you directly. We do not control and are not responsible for
        what a sponsor does with information disclosed to them, and we make no
        representation that participation will result in an interview, an offer or any
        response.
      </p>

      <h2>5. Automated resume assessment</h2>
      <p>
        The resume assessment is generated automatically and is provided for general
        guidance only. It is not professional, career or employment advice, and it does not
        represent the view of the chapter or of any employer.
      </p>

      <h2>6. Availability and disclaimer</h2>
      <p>
        The portal is operated by student volunteers and is provided free of charge, on an
        "as is" and "as available" basis, without warranties of any kind. We do not warrant
        that it will be uninterrupted, error free, or that information stored in it will not
        be lost. You should keep your own copy of your resume.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, ColorStack at Georgia State University and
        its officers are not liable for any indirect, incidental or consequential damages,
        or for any loss of data, arising from your use of the portal.
      </p>

      <h2>8. Suspension and termination</h2>
      <p>
        You may request deletion of your account at any time. We may suspend or terminate an
        account that is used to harass others, to disrupt the portal, or to misrepresent
        someone's identity, without prior notice where the circumstances warrant it.
      </p>

      <h2>9. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. If we make a material change, we will
        notify members by email. Continuing to use the portal after a change takes effect
        constitutes acceptance of it.
      </p>

      <h2>10. Relationship to the university and to ColorStack Inc.</h2>
      <p>
        ColorStack at Georgia State University is a registered student organization. It is
        not Georgia State University and not ColorStack Inc. Neither operates the portal nor
        is responsible for it.
      </p>

      <h2>11. Governing law</h2>
      <p>These terms are governed by the laws of the State of Georgia.</p>
    </LegalPage>
  );
}
