import type { ReactNode } from 'react';

/**
 * A label and its input, using the existing .field-label / .field-input classes.
 *
 * Extracted because the profile page has twenty of these and the pairing was previously
 * repeated by hand on every screen, which is how a label ends up pointing at the wrong
 * id. Nothing more is abstracted: the styling still lives in index.css, and anything
 * that needs a different control passes it as a child.
 */

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  children?: ReactNode;
  type?: string;
  value?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'numeric' | 'email' | 'url';
  disabled?: boolean;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
};

export default function Field({
  id,
  label,
  hint,
  children,
  type = 'text',
  value,
  placeholder,
  autoComplete,
  inputMode,
  disabled,
  onChange,
  style,
}: FieldProps) {
  return (
    <div style={style}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {children ?? (
        <input
          id={id}
          type={type}
          className="field-input"
          value={value ?? ''}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
      {hint && (
        <p className="muted" style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.45 }}>
          {hint}
        </p>
      )}
    </div>
  );
}
