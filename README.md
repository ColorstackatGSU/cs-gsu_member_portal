# ColorStack @ GSU Member Portal

Members sign in, view and edit everything they put on the intake form, and upload a resume.
Deploys to **members.colorstackatgsu.com**.

**Status: working end to end locally.** Activation, sign in, profile editing, resume upload
and sponsor-visibility consent are all wired to the API.

```bash
npm install
cp .env.example .env.local
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

You also need the API and the database running. Both live in `../cs-gsu_backend`; see
[Local development](#local-development).

## House style

**No em dashes.** Not in UI copy, not in comments, not in this file. Use a colon, a comma,
parentheses, or two sentences.

## Architecture

This portal has **no backend of its own**. It used to: there was a Supabase project here,
with its own migrations and an Edge Function, built before the chapter settled on one shared
service. That is all gone.

- **Supabase** is used for exactly one thing, proving who you are. `signInWithPassword`
  returns a token and nothing else in this app touches Supabase again.
- **The Spring API** in `../cs-gsu_backend` owns every byte. It validates that token and runs
  each query under the caller's identity, with row-level security underneath.
- **Vercel** serves the static build. No `/api` routes, no serverless functions.

The same split is what the sponsor portal uses, which is the point: one service, one schema,
one place secrets live.

That is why the anon key is safe in the bundle. It can start a sign in and nothing else:
self-signup is disabled on the project, so it cannot mint an account, and every table it
could reach through PostgREST has RLS with no policy matching an anonymous caller.

| File | What |
| --- | --- |
| [`src/lib/supabase.ts`](src/lib/supabase.ts) | the auth client, and only the auth client |
| [`src/lib/api.ts`](src/lib/api.ts) | fetch wrapper: attaches the token, parses problem responses |
| [`src/lib/member.ts`](src/lib/member.ts) | the profile type and every endpoint this app calls |
| [`src/auth/context.ts`](src/auth/context.ts) | the auth context and `useAuth` |
| [`src/auth/AuthProvider.tsx`](src/auth/AuthProvider.tsx) | session state and the `RequireAuth` guard |

## Auth flow

Members claim their account once, then it is email and password from then on.

| Route | Who | What happens |
| --- | --- | --- |
| `/activate` | First time only | Email, then the 6-digit code we send, then a password |
| `/login` | Everyone after | Email and password |
| `/profile` | Signed in | Everything from the form, editable, plus the resume |
| `/settings` | Signed in | Sponsor visibility, and sign out |

Four rules, all enforced by the API and none enforceable here:

1. **No `members` row means no account.** The row is created by the Google Form.
2. **An account can only be claimed once.**
3. **Three codes per address per day**, counted in Postgres so concurrent requests cannot
   both slip past.
4. **Five guesses per code**, then it is dead and they need a new one.

Either address on file works, school or personal, and the portal signs them in with the
school one either way, so the login and the profile can never drift apart.

## Local development

**Prerequisite: Docker Desktop must be running.** Everything below is on your own machine.

```bash
# In ../cs-gsu_backend, which owns the database and the API
supabase start
supabase db reset      # re-runs migrations and the seed
./mvnw spring-boot:run # the API, on :8080

# Here
npm run dev
```

| What | Where |
| --- | --- |
| The API | http://127.0.0.1:8080 |
| Supabase API | http://127.0.0.1:54421 |
| Studio (table editor) | http://127.0.0.1:54423 |
| Postgres | `postgresql://postgres:postgres@127.0.0.1:54422/postgres` |

Ports are in the 544xx band because the backend repo owns the Supabase project.

### Seeded test accounts

From `../cs-gsu_backend/supabase/seed.sql`, standing in for form submissions:

| Email | Password | Exercises |
| --- | --- | --- |
| `dev.member@student.gsu.edu` | `local-dev-password` | signing straight in, a filled-in profile |
| `newbie@student.gsu.edu` | none yet | claiming an account for the first time |
| `jane.doe@johndoe.example` | `local-dev-password` | a sponsor contact, so `/profile` 404s |
| anything else | | the "not a member" rejection |

### Testing against the real form data

The backend reads the live response sheet directly, so with the Google credentials set in
`../cs-gsu_backend/.env` one call fills your local database with the real responses,
including your own:

```bash
curl -X POST http://127.0.0.1:8080/intake/sync -H "X-Intake-Secret: local-dev-intake-secret"
```

At that point the whole production flow runs on your laptop, and the only difference from
production is that the portal talks to `:8080`.

Re-running the sync is safe, and it leaves an already-activated member's profile edits
alone. See the backend README for the one-time service account setup.

To fake a single new submission instead, post to the webhook. It exercises the same path
Apps Script uses:

```bash
curl -X POST http://127.0.0.1:8080/intake/form-response \
  -H "Content-Type: application/json" -H "X-Intake-Secret: local-dev-intake-secret" \
  -d '{"responseId":"r1","submittedAt":"2026-08-16T14:03:00Z",
       "answers":{"Student Email":"you@student.gsu.edu","First Name":"You"}}'
```

## Design system

Ported from `../cs-gsu_official_website`. The source of truth is the `:root` block in
[`src/index.css`](src/index.css), **not** `tailwind.config.js`.

Note the main site's `tailwind.config.js` declares Space Grotesk and its `index.css` has a
stale Space Grotesk `@import`, but its `--display` and `--mono` vars both resolve to
**Montserrat** and every component reads those vars, so Space Grotesk never actually renders.
This repo drops the dead config and uses Montserrat throughout.

- Paper `#091024`, warm panel `#0d152d`, ink `#ffffff` (dark only)
- GSU blue `#0039A6`, bright `#1d56c9`, dim `#002a7a`, sky `#97CAEB`, red `#CC0000`
- Fully-rounded buttons, uppercase 13px Montserrat, `0.04em` tracking
- Floating white pill navbar, `rgba(255,255,255,0.92)` with `blur(20px)`

**Login and Activate are light**, a white card over a photo mosaic. **Profile and Settings stay
dark navy** so form data reads cleanly. The light overrides are all scoped to `.auth-card` /
`.auth-page`.

There is no component library, deliberately. Only two things were worth extracting:
[`Field.tsx`](src/components/Field.tsx) for the label and input pairing the profile repeats
twenty times, and [`Notice.tsx`](src/components/Notice.tsx) for messages. Everything else is a
raw element with a class from `index.css`.

`Notice` has an amber `warn` variant that exists for exactly one message: telling a member
their profile is not visible to recruiters. Declining to share a resume is a legitimate
choice, so it must be noticeable without reading as an error.

### The photo mosaic

`PhotoMosaic.tsx` renders a tilted, slowly scrolling wall of chapter and ColorStack nationals
photos. Tiles are built by `scripts/build-mosaic.mjs`:

```bash
node scripts/build-mosaic.mjs   # only when the source photos change
```

Three rules, all learned the hard way:

- **No headshots.** Portraits read as mugshots at tile size.
- **One smart crop per photo.** Cutting a grid of crops out of each photo to pad the tile count
  halves faces and produces tiles of empty floor.
- **Too much repetition means fewer slots, not more crops.** There are only ~14 usable photos.
  Turn `COLUMNS` / `TILES_PER_COLUMN` down and the tiles up.

Output is versioned (`public/images/mosaic/v1/`) and `vercel.json` serves it
`immutable` for a year, so it downloads once per visitor. Changing the photos means bumping
`VERSION` in the script, which changes the path and busts the cache automatically.

`source-photos/` holds a few originals pulled from colorstack.org so the build is reproducible
without re-scraping. It is not shipped to the browser.

### Auth pages must not scroll

Sign in and activation are pinned to exactly one viewport (`.auth-page`, `100dvh`), with
short-viewport media queries clawing back height at 800px and 700px. Verified at 1440x900,
1280x720, 1280x620 and 390x844. If you add a field, take height back somewhere else and
re-check, or the form starts scrolling again.

Profile and Settings are ordinary scrolling pages. That constraint applies to the two auth
screens only.

## Editing the profile form

The profile posts every editable field on save rather than a diff, and the API replaces that
half of the row wholesale. That is deliberate: over JSON there is no way to tell "field
omitted" from "field cleared" without a wrapper type on all twenty columns, and getting it
wrong silently wipes data.

So adding a field means three places, and TypeScript will fail the build until all three
agree: the column in the migration, the field on `MemberProfile` and `EDITABLE_KEYS` in
[`src/lib/member.ts`](src/lib/member.ts), and `UpdateProfileBody.java` on the API. The
`satisfies` clause on `EDITABLE_KEYS` is what makes the second one a compile error rather
than a silently dropped field.

## What is left

1. Create the Supabase cloud project, `supabase link` and `supabase db push` from the backend
   repo, then put the URL and **anon** key into Vercel. The `service_role` key must never
   enter this repo or the browser bundle.
2. Set `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD` and `MAIL_FROM` in the API's
   environment, using a Google App Password for `official@colorstackatgsu.com`.
3. Install the Apps Script trigger on the intake form. The script and its instructions are in
   `../cs-gsu_backend/scripts/intake-form-trigger.gs`.
4. DNS: CNAME `members` to Vercel.
5. A password reset path. Supabase can send the email, but the same quota argument applies, so
   it probably belongs on the API alongside activation.
6. The sponsor read path for the resume book. `resume_shared` is already recorded; the policy
   that lets a sponsor read a file they do not own is not written.
7. Event and hackathon registration, which is the reason the profile exists in this shape.
