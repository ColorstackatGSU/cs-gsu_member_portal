import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import Notice from '../components/Notice';

/**
 * The chapter's events, as officers write them in the admin portal.
 *
 * This used to be hand-written blocks, one per event, in the order somebody typed them, so
 * September sat at the top in November. It reads GET /events now and sorts by date the way
 * progsu's portal does: Upcoming shows the next event first, Past shows the most recent
 * first, and each event sits beside its date so the page reads as a timeline.
 *
 * Every time is shown in Atlanta time, whatever the member's own clock says, because that
 * is where the room is.
 */

type ChapterEvent = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  flyerUrl: string | null;
};

type Tab = 'upcoming' | 'past';

const ZONE = 'America/New_York';

const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
const monthDay = new Intl.DateTimeFormat('en-US', { timeZone: ZONE, month: 'short', day: 'numeric' });
const monthDayYear = new Intl.DateTimeFormat('en-US', { timeZone: ZONE, month: 'short', day: 'numeric', year: 'numeric' });
const weekday = new Intl.DateTimeFormat('en-US', { timeZone: ZONE, weekday: 'long' });
const shortDay = new Intl.DateTimeFormat('en-US', { timeZone: ZONE, weekday: 'short', month: 'short', day: 'numeric' });
const clock = new Intl.DateTimeFormat('en-US', { timeZone: ZONE, hour: 'numeric', minute: '2-digit' });

/** Upcoming until it is over: its end, or its start when it has no end, is still ahead. */
function isUpcoming(e: ChapterEvent, now: number) {
  return new Date(e.endsAt ?? e.startsAt).getTime() >= now;
}

/** "Today", "Tomorrow", or "Nov 20". The year only appears when it is not this one. */
function dateLabel(start: Date, now: number): string {
  const today = new Date(now);
  const key = dayKey.format(start);
  if (key === dayKey.format(today)) return 'Today';
  if (key === dayKey.format(new Date(now + 86_400_000))) return 'Tomorrow';
  const sameYear = key.slice(0, 4) === dayKey.format(today).slice(0, 4);
  return (sameYear ? monthDay : monthDayYear).format(start);
}

/** "6:00 PM to 7:30 PM", or across days "Fri, Oct 9, 3:00 PM to Sun, Oct 11, 3:00 PM". */
function timeRange(e: ChapterEvent): string {
  const start = new Date(e.startsAt);
  if (!e.endsAt) return clock.format(start);
  const end = new Date(e.endsAt);
  if (dayKey.format(start) === dayKey.format(end)) {
    return `${clock.format(start)} to ${clock.format(end)}`;
  }
  return `${shortDay.format(start)}, ${clock.format(start)} to ${shortDay.format(end)}, ${clock.format(end)}`;
}

export default function Events() {
  const [events, setEvents] = useState<ChapterEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('upcoming');
  // Read once per visit: which side of now an event sits on does not need to tick live.
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    api
      .get<ChapterEvent[]>('/events')
      .then((rows) => !cancelled && setEvents(rows))
      .catch((e: unknown) => {
        if (cancelled) return;
        setEvents([]);
        setError(e instanceof Error ? e.message : 'Could not load events.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = (events ?? [])
    .filter((e) => isUpcoming(e, now))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = (events ?? [])
    .filter((e) => !isUpcoming(e, now))
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const shown = tab === 'upcoming' ? upcoming : past;

  return (
    <section className="portal-pad">
      <div className="container-wide" style={{ maxWidth: 880 }}>
        <div className="fade-in-up page-head events-head">
          <div>
            <p className="section-eyebrow" style={{ marginBottom: 12 }}>Member Portal</p>
            <h1 className="page-title">Events</h1>
          </div>
          <div className="events-tabs" role="tablist" aria-label="Which events">
            {(['upcoming', 'past'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                className={tab === t ? 'events-tab active' : 'events-tab'}
                onClick={() => setTab(t)}
              >
                {t === 'upcoming' ? 'Upcoming' : 'Past'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <Notice kind="error" style={{ marginBottom: 20 }}>
            {error}
          </Notice>
        )}

        {events === null ? (
          <p className="card-sub" role="status">Loading events…</p>
        ) : shown.length === 0 ? (
          <div className="card fade-in-up">
            <h2 className="card-title">
              {tab === 'upcoming' ? 'Nothing scheduled yet' : 'No past events yet'}
            </h2>
            <p className="card-sub">
              {tab === 'upcoming'
                ? 'New events show up here as soon as officers post them. Check PIN for anything else on campus.'
                : 'Events move here once they are over.'}
            </p>
          </div>
        ) : (
          <ol className="events-timeline fade-in-up fade-delay-1">
            {shown.map((e) => {
              const start = new Date(e.startsAt);
              const label = dateLabel(start, now);
              return (
                <li key={e.id} className="events-item">
                  <div className="events-date">
                    <span className={label === 'Today' ? 'events-date-main today' : 'events-date-main'}>{label}</span>
                    <span className="events-date-sub">{weekday.format(start)}</span>
                  </div>

                  <article className="card events-card">
                    <div className="events-card-body">
                      <p className="events-time">{timeRange(e)}</p>
                      <h2 className="events-title">{e.title}</h2>
                      {e.location && (
                        <p className="events-location">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
                            <circle cx="12" cy="10" r="2.5" />
                          </svg>
                          {e.location}
                        </p>
                      )}
                      {e.description && <p className="card-sub">{e.description}</p>}
                      {e.linkUrl && (
                        <a
                          href={e.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={tab === 'upcoming' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
                          style={{ marginTop: 14, alignSelf: 'flex-start' }}
                        >
                          {e.linkLabel || 'Details'} ↗
                        </a>
                      )}
                    </div>

                    {e.flyerUrl &&
                      (e.linkUrl ? (
                        <a
                          href={e.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="event-flyer events-flyer"
                          aria-label={`${e.linkLabel || 'Details'}: ${e.title}`}
                        >
                          <span className="event-flyer-media">
                            <img src={e.flyerUrl} alt={`${e.title} flyer`} className="event-flyer-img" loading="lazy" />
                          </span>
                        </a>
                      ) : (
                        <span className="event-flyer events-flyer">
                          <span className="event-flyer-media">
                            <img src={e.flyerUrl} alt={`${e.title} flyer`} className="event-flyer-img" loading="lazy" />
                          </span>
                        </span>
                      ))}
                  </article>
                </li>
              );
            })}
          </ol>
        )}

        <p style={{ marginTop: 28 }}>
          <a
            href="https://pin.gsu.edu/organization/colorstack"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
            style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            View all events on PIN ↗
          </a>
        </p>
      </div>
    </section>
  );
}
