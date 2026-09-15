import { useState } from 'react';

/**
 * One input per major, for members with a double major (or more).
 *
 * Stored the way it always has been: a single text column, comma-joined. The intake form
 * writes it that way, and the admin portal, sponsor directory, tech league and the OIDC
 * profile claim all read it as plain text, so splitting it into rows here changes nothing
 * for any of them. A value typed as "CS, Math" in one box comes back as two boxes.
 *
 * The rows are local state rather than derived from the value, because a freshly added
 * blank row has no representation in a comma-joined string and would vanish on the
 * next render.
 */

const MAX_MAJORS = 4;

function split(value: string | null): string[] {
  const parts = (value ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : [''];
}

function join(rows: string[]): string | null {
  const joined = rows.map((s) => s.trim()).filter(Boolean).join(', ');
  return joined === '' ? null : joined;
}

export default function MajorsField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [rows, setRows] = useState(() => split(value));
  const [seen, setSeen] = useState(value);

  // The value changed from outside (a reload, a discarded edit), not from these rows:
  // start over from it. Adjusted during render rather than in an effect, so there is no
  // frame showing the stale rows.
  if (value !== seen) {
    setSeen(value);
    if (join(rows) !== value) setRows(split(value));
  }

  function update(next: string[]) {
    setRows(next);
    const joined = join(next);
    setSeen(joined);
    onChange(joined);
  }

  const canAdd = rows.length < MAX_MAJORS && rows[rows.length - 1].trim() !== '';

  return (
    <div>
      <label className="field-label" htmlFor="majors-0">
        Majors
      </label>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map((major, i) => (
          <div key={i} style={{ display: 'flex', gap: 8 }}>
            <input
              id={`majors-${i}`}
              className="field-input"
              value={major}
              maxLength={60}
              placeholder={i === 0 ? 'Computer Science' : 'Second major'}
              aria-label={i === 0 ? undefined : `Major ${i + 1}`}
              onChange={(e) => update(rows.map((r, j) => (j === i ? e.target.value : r)))}
            />
            {rows.length > 1 && (
              <button
                type="button"
                className="btn-secondary btn-sm"
                style={{ alignSelf: 'stretch' }}
                aria-label={`Remove ${major.trim() || `major ${i + 1}`}`}
                onClick={() => update(rows.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      {canAdd && (
        <button
          type="button"
          className="link-button"
          style={{ marginTop: 8, fontSize: 14 }}
          onClick={() => setRows([...rows, ''])}
        >
          + Add another major
        </button>
      )}
    </div>
  );
}
