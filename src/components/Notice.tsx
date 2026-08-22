import type { ReactNode } from 'react';

/**
 * The one place a message to the member gets rendered.
 *
 * `info` and `error` map onto the existing classes in index.css. `warn` is new, and it
 * exists for exactly one message: telling a member their profile is not visible to
 * recruiters. That needs to be noticeable without reading as a failure, because
 * declining to share a resume is a legitimate choice rather than a mistake, so it is
 * amber rather than red and it can be dismissed.
 */

type NoticeProps = {
  kind?: 'info' | 'error' | 'warn';
  children: ReactNode;
  onDismiss?: () => void;
  style?: React.CSSProperties;
};

const CLASS: Record<NonNullable<NoticeProps['kind']>, string> = {
  info: 'notice-info',
  error: 'notice-error',
  warn: 'notice-warn',
};

export default function Notice({ kind = 'info', children, onDismiss, style }: NoticeProps) {
  return (
    <div
      className={CLASS[kind]}
      role={kind === 'error' ? 'alert' : 'status'}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, ...style }}
    >
      <div style={{ flex: 1 }}>{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            flex: 'none',
            background: 'none',
            border: '2px solid var(--ink)',
            cursor: 'pointer',
            color: 'inherit',
            fontFamily: 'var(--mono)',
            fontSize: 14,
            lineHeight: 1,
            width: 22,
            height: 22,
            display: 'grid',
            placeItems: 'center',
            padding: 0,
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
}
