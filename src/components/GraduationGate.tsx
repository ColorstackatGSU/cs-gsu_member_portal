import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { memberApi, toEdits } from '../lib/member';
import type { MemberProfile } from '../lib/member';
import { GRAD_TERMS, gradYears, needsGraduation } from '../lib/graduation';
import { ApiError } from '../lib/api';
import Notice from '../components/Notice';
import Field from '../components/Field';

/**
 * Stops a member at the door until the portal knows when they graduate.
 *
 * The form used to ask this as free text and people answered "2029", "may 2027" or
 * nothing at all, none of which survive the parse into a term and a year. The form is a
 * fixed list now, but it still has an "Other" box, and every member who applied before
 * the change is still carrying whatever they typed. This is where that gets corrected:
 * two dropdowns that cannot produce a value the database will not take.
 *
 * It sits inside RequireAuth and outside Settings, so a member who would rather not
 * answer can still reach their account and sign out rather than being trapped.
 */

function message(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Something went wrong. Try again in a moment.';
}

export default function GraduationGate() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [term, setTerm] = useState('');
  const [year, setYear] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    memberApi
      .load()
      .then((p) => {
        setProfile(p);
        // Prefilled from whatever survived, so a member who has one half only has to
        // answer the other.
        setTerm(p.gradTerm ?? '');
        setYear(p.gradYear === null ? '' : String(p.gradYear));
      })
      .catch((e) => setLoadError(message(e)));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !term || !year) return;

    setSaving(true);
    setSaveError(null);
    try {
      // The API replaces the editable half wholesale, so the body carries the rest of the
      // profile unchanged rather than just the two answers.
      const saved = await memberApi.save({
        ...toEdits(profile),
        gradTerm: term,
        gradYear: Number(year),
      });
      setProfile(saved);
    } catch (err) {
      setSaveError(message(err));
    } finally {
      setSaving(false);
    }
  }

  // A failure to read the profile must not lock the portal. The gate is a data quality
  // measure, not a security control, and the API is the thing that enforces the shape.
  if (loadError) return <Outlet />;

  if (!profile) {
    return (
      <section className="portal-pad">
        <div className="container-wide" style={{ maxWidth: 1100 }}>
          <div className="skeleton" style={{ height: 240 }} />
        </div>
      </section>
    );
  }

  if (!needsGraduation(profile)) return <Outlet />;

  return (
    <section className="portal-pad">
      <div className="container-wide" style={{ maxWidth: 560, display: 'grid', gap: 20 }}>
        <div>
          <h1 className="page-title">When do you graduate?</h1>
          <p className="muted" style={{ marginTop: 8, lineHeight: 1.55 }}>
            One answer and you are through. Sponsors filter the resume book by graduating
            class, so a member without one does not appear when a recruiter goes looking.
          </p>
        </div>

        {saveError && <Notice kind="error">{saveError}</Notice>}

        <form onSubmit={save} style={{ display: 'grid', gap: 16 }}>
          <Field id="gate-grad-term" label="Graduation term">
            <select
              id="gate-grad-term"
              className="field-input"
              value={term}
              required
              onChange={(e) => setTerm(e.target.value)}
            >
              <option value="" disabled>
                Select a term
              </option>
              {GRAD_TERMS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="gate-grad-year"
            label="Graduation year"
            hint="An estimate is fine. You can change it on your profile whenever it moves."
          >
            <select
              id="gate-grad-year"
              className="field-input"
              value={year}
              required
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="" disabled>
                Select a year
              </option>
              {gradYears().map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </Field>

          <button className="btn-primary" type="submit" disabled={saving || !term || !year}>
            {saving ? 'Saving...' : 'Save and continue'}
          </button>
        </form>
      </div>
    </section>
  );
}
