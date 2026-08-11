# Testing

## Strategy

GradeFlow's testing focuses on the parts of the system where a bug would silently produce a wrong grade or a permission leak — the two things a grading system absolutely cannot get wrong. Concretely:

1. **Unit tests** (Vitest) cover the grading math (Strategy pattern), the write-path validation (Chain of Responsibility), Zod schema boundaries (score/weight ranges), and the permission checks at the top of each service method - all pure/fast, no database required.
2. **Manual, browser-driven end-to-end verification** (documented below) exercises the full stack against a real PostgreSQL database with seeded Hebrew demo data: login, dashboard, CRUD flows, grade entry, calculated final grades, RTL rendering, and server-side authorization boundaries.

A Playwright browser toolchain was not installed as a separate dependency for this submission; end-to-end verification instead used a real, connected browser (Chrome via MCP browser automation) driving the actual running app, which exercises the same surface a Playwright spec would (page loads, form submission, navigation, authorization redirects) while also catching runtime/console errors Playwright specs sometimes miss. See "End-to-end verification" below for exactly what was checked and how.

## Automated tests implemented

All in `tests/unit/`:

### `grading.test.ts` — Strategy pattern
- The textbook weighted-average example: `85@40% + 90@40% + 100@20% = 90`
- Missing grades are excluded and the remaining weight is re-normalized (not treated as zero)
- Returns `null`/`isComplete: false` when nothing is graded yet, and for an empty assessment list
- A single, fully-weighted assessment
- `SimpleAverageStrategy` ignores weights (proves the abstraction is real, not just one hard-coded formula)
- `getGradingStrategy()` factory defaults to weighted-average and can return simple-average on request

### `validation-schemas.test.ts` — Zod boundaries
- Grade score: accepts 0–100 inclusive, rejects -1 and 101, allows `null` (clearing a grade)
- Assessment weight: accepts `(0, 100]`, rejects 0, negative, and >100

### `validation-chain.test.ts` — Chain of Responsibility
Uses in-memory fake ports (no database) to test both chains in isolation:
- **Grade submission chain** (`Authorization → Enrollment → Assessment → GradeRange`): admin passes; a teacher not assigned to the course is rejected by the *first* handler (`ForbiddenError`) even when other fields are invalid too, proving handler order; unenrolled student rejected (`ValidationError`); assessment/course mismatch rejected (`NotFoundError`); out-of-range score rejected (`ValidationError`) even for an admin; `null` score (clearing a grade) is allowed.
- **Assessment publication chain** (`Authorization → WeightTotal`): publishing at exactly 100% total succeeds; publishing past 100% is rejected; an unassigned teacher is rejected before the weight check even runs.

### `permissions.test.ts` — service-level authorization
Confirms `studentService` and `courseService` reject a `TEACHER` actor attempting admin-only operations (`create`, `setActive`, `assignTeacher`, `enrollStudent`) with `ForbiddenError` - and that this happens before any database access (these checks run first in each method).

## Commands

```bash
npm run typecheck   # tsc --noEmit
npm run lint          # eslint
npm test              # vitest run
npm run build          # next build (production build + type-check)
```

## Final results (this submission)

| Check | Result |
|---|---|
| `npm run typecheck` | ✅ PASS — 0 errors |
| `npm run lint` | ✅ PASS — 0 errors, 0 warnings |
| `npm test` | ✅ PASS — 4 test files, **34/34 tests passed** |
| `npm run build` | ✅ PASS — production build succeeded, all 18 routes compiled |

## End-to-end verification (manual, browser-driven)

Performed against `npm run dev` with `npm run db:seed` data, using a real connected browser:

- ✅ Login as admin (`admin@gradeflow.school`) — RTL layout, Hebrew labels, demo-credentials hint all render correctly
- ✅ Dashboard loads with real, correct metrics (active students / courses / assessments / grades entered / average grade)
- ✅ Students list renders, including active/inactive status badges
- ✅ Course detail page: teacher assignment, enrolled students, assessment table with live total/published weight indicators
- ✅ Grade entry: bulk grade sheet loads pre-filled; client-side `max=100` validation blocks an out-of-range score at the browser level; a valid save shows "הציונים נשמרו בהצלחה" and persists
- ✅ Final grades page: **verified the weighted-average arithmetic by hand against the UI** (e.g. `94×0.30 + 100×0.20 + 86×0.40 + 98×0.10 = 92.4`, matching exactly)
- ✅ Printable student report card: renders per-course breakdown, overall average, RTL layout, print button
- ✅ Creating a new student end-to-end: form → Server Action → redirect → list shows the new row
- ✅ Teacher login (`dana.levi@gradeflow.school`): sidebar correctly hides "תלמידים" (admin-only); dashboard metrics correctly scoped to her 2 assigned courses only
- ✅ Server-side authorization (not just hidden UI): a teacher navigating directly to `/students` is redirected to `/dashboard?error=forbidden`; navigating directly to a course they don't teach returns 404 (via a caught `ForbiddenError`, not an information-leaking error page)
- ✅ Mobile responsive layout: narrow viewport correctly swaps the desktop sidebar for a hamburger-triggered slide-over menu with the same navigation and logout
- ✅ No console errors during normal use (checked via browser console)

### Bugs found and fixed during this pass

Manual E2E verification caught two real issues that unit tests and the build could not have caught, both fixed before this submission:

1. **RSC serialization bug**: nav items (carrying `lucide-react` icon component references) were being resolved in a Server Component and passed as props to the `AppShell` Client Component. React Server Components cannot serialize arbitrary component references across that boundary. Fixed by resolving nav items *inside* the Client Component from a plain `role` string instead.
2. **Blocking native dialogs**: destructive actions (delete, deactivate) used `window.confirm()`/`window.alert()`. Besides being poor UX for a modern SaaS product, a native dialog freezes the entire page (including further automated interaction) until manually dismissed. Replaced with an in-place "click again to confirm" pattern and inline error text — no native dialogs remain anywhere in the app.
