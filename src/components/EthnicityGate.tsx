import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { memberApi, toEdits } from '../lib/member';
import type { MemberProfile } from '../lib/member';
import {
  PREFER_NOT_TO_SAY,
  RACE_ETHNICITY_OPTIONS,
  needsEthnicity,
  toggleCategory,
} from '../lib/ethnicity';
import { ApiError } from '../lib/api';
import Notice from '../components/Notice';

/**
 * Stops a member at the door until the portal has asked about race and ethnicity once.
 *
 * This is the one fact a ColorStack chapter most needs about its own membership, and the
 * intake form has never asked for it. Every impact report, grant application and sponsor
 * conversation that wants the number has been answered with an estimate. The gate exists
 * because a field buried on the profile page would be answered by the members who were
 * going to be counted anyway, which is precisely the population whose count needs no
 * help.
 *
 * Declining is a complete answer. "Prefer not to say" satisfies the gate permanently, is
 * rendered the same size and weight as every category, and is stored, so a member who
 * declines is asked once and never again. A gate that only accepts a real answer is not
 * collecting self-identification, it is extracting it.
 *
 * Mounted after GraduationGate so a member with both gaps answers the smaller question
 * first. Each gate loads the profile itself rather than sharing one fetch: two requests
 * on entry to the portal, against two components that can each be read, changed and
 * deleted without touching the other.
 */

function message(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Something went wrong. Try again in a moment.';
}

export default function EthnicityGate() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    memberApi
      .load()
      .then((p) => {
        setProfile(p);
        setSelected(p.raceEthnicity ?? []);
      })
      .catch((e) => setLoadError(message(e)));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || selected.length === 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      // The API replaces the editable half wholesale, so the body carries the rest of the
      // profile unchanged rather than just this answer.
      const saved = await memberApi.save({ ...toEdits(profile), raceEthnicity: selected });
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

  if (!needsEthnicity(profile)) return <Outlet />;

  const declined = selected.includes(PREFER_NOT_TO_SAY);

  return (
    <section className="portal-pad">
      <div className="container-wide" style={{ maxWidth: 560, display: 'grid', gap: 20 }}>
        <div>
          <h1 className="page-title">How do you identify?</h1>
          <p className="muted" style={{ marginTop: 8, lineHeight: 1.55 }}>
            We ask once. ColorStack exists to support Black, Latinx and Native students in
            computing, and we report on how well we are doing that — to sponsors, to
            national, and on every grant application. Right now we are estimating.
          </p>
          <p className="muted" style={{ marginTop: 8, lineHeight: 1.55 }}>
            Select all that apply, or choose not to say. Either way you are through, and
            this is never shared with sponsors or shown on your profile to anyone else.
          </p>
        </div>

        {saveError && <Notice kind="error">{saveError}</Notice>}

        <form onSubmit={save} style={{ display: 'grid', gap: 16 }}>
          <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            <legend className="field-label" style={{ marginBottom: 6 }}>
              Race and ethnicity
            </legend>

            {RACE_ETHNICITY_OPTIONS.map((option) => (
              <label
                key={option}
                style={{ display: 'flex', gap: 10, alignItems: 'flex-start', lineHeight: 1.4 }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => setSelected((s) => toggleCategory(s, option))}
                  style={{ marginTop: 3 }}
                />
                <span>{option}</span>
              </label>
            ))}

            {/* Separated by a rule rather than by styling, because it is a different kind
                of answer, not a lesser one. Same size, same weight, same position in the
                tab order as every category above it. */}
            <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '4px 0' }} />

            <label
              style={{ display: 'flex', gap: 10, alignItems: 'flex-start', lineHeight: 1.4 }}
            >
              <input
                type="checkbox"
                checked={declined}
                onChange={() => setSelected((s) => toggleCategory(s, PREFER_NOT_TO_SAY))}
                style={{ marginTop: 3 }}
              />
              <span>{PREFER_NOT_TO_SAY}</span>
            </label>
          </fieldset>

          <button className="btn-primary" type="submit" disabled={saving || selected.length === 0}>
            {saving ? 'Saving...' : 'Save and continue'}
          </button>
        </form>
      </div>
    </section>
  );
}
