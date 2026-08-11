# GradeFlow

מערכת לניהול מודול הערכה בית ספרי — ניהול מקצועות, הערכות, ציונים ותעודות עבור מורים ומנהלי מערכת.

**Project 03 — School Assessment Management Module**, final project for the course **Advanced Topics in Software Development** ("נושאים מתקדמים בפיתוח תוכנה").

## Course

Advanced Topics in Software Development (נושאים מתקדמים בפיתוח תוכנה)

## Problem

Schools need a reliable way for teachers to define how a course's final grade is built (which assessments count, and at what weight), enter and update student grades, and produce accurate, presentable grade reports — while administrators need oversight of teachers, students, courses and enrollment, all enforced with real permissions rather than convention.

## Solution

GradeFlow is a Hebrew-first (RTL) web application where:

- **Admins** manage teachers, students, courses, teacher-course assignments and student enrollment, and can view every report.
- **Teachers** manage the assessments and grading scheme for the courses they are assigned to, enter grades for their enrolled students, and generate reports for their own courses only.
- Final grades are computed with a **weighted average** strategy from the *published* assessments in a course, and are visible per-course and as a printable, per-student report card.
- Every write path (grade entry, assessment publication) runs through explicit, server-side validation — permission checks are never just a hidden button.

## Features

- Credentials-based login with hashed passwords and signed, httpOnly session cookies
- Role-based access control (ADMIN / TEACHER), enforced server-side on every read and write
- Student management: list, search, create, edit, activate/deactivate
- Course management: create, edit, assign teacher(s), enroll/unenroll students
- Assessment management per course: type, weight, date, publish/unpublish, delete (when safe)
- Live "total weight" indicator per course, with a hard rule that a course's *published* weight can never exceed 100%
- Fast grade-entry sheet: one row per enrolled student, bulk save, 0–100 validation
- Weighted-average final grade calculation, with clear "partial" vs "final" status when grades are missing
- Course grade report and a printable/PDF-able individual student report card, fully RTL
- Dashboard metrics scoped to the signed-in user's role
- Hebrew, RTL, responsive UI (desktop sidebar, mobile slide-over navigation)

## Technology stack

- **Framework:** Next.js 16 (App Router, Server Actions, Turbopack), React 19, TypeScript
- **Styling:** Tailwind CSS v4, lucide-react icons
- **Database:** PostgreSQL
- **ORM:** Prisma ORM 7 (`prisma-client` generator + `@prisma/adapter-pg` driver adapter)
- **Auth:** Custom credentials auth — bcryptjs password hashing, `jose`-signed JWT session cookies (httpOnly, sameSite=lax)
- **Validation:** Zod
- **Testing:** Vitest (unit tests); manual/browser-driven end-to-end verification (see `docs/TESTING.md`)

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full breakdown, folder-by-folder, with a dependency diagram.

In short: `app/` (routes, layouts, Server Actions) → `services/` (business rules, permissions) → `repositories/` (Prisma data access), with `patterns/` holding the Strategy and Chain of Responsibility implementations the services call into, and `validation/` holding the Zod input schemas.

## Design Patterns

GradeFlow deliberately demonstrates three patterns, each solving a real problem in the app rather than existing for its own sake:

### Singleton — `src/lib/db.ts`

A single, shared `PrismaClient` instance, cached on `globalThis` in development so Next.js's hot-reload doesn't spawn a new PostgreSQL connection pool on every file save. In production a process creates exactly one instance for its lifetime. Every repository imports `db` from this one module.

### Strategy — `src/patterns/grading/`

`GradingStrategy` is an interface with one method, `calculate(assessments) -> GradeCalculationResult`. `WeightedAverageStrategy` (the production default) and `SimpleAverageStrategy` (an alternative, used in tests to prove the abstraction is real) both implement it. `grade.service.ts` calls `getGradingStrategy()` and depends only on the interface — swapping the default grading policy for a whole school would mean changing one factory call, not hunting for grade-math scattered across components.

### Chain of Responsibility — `src/patterns/validation/`

Two real write flows are guarded by handler chains:

- **Grade submission** (`grade-submission/`): `AuthorizationValidationHandler` → `StudentEnrollmentValidationHandler` → `AssessmentValidationHandler` → `GradeRangeValidationHandler`. Each handler checks exactly one thing and either calls the next handler or throws a specific, Hebrew, user-facing error.
- **Assessment publication** (`assessment-publication/`): `AuthorizationValidationHandler` → `WeightTotalValidationHandler`, which enforces that a course's published weight can never exceed 100%.

`grade.service.ts` and `assessment.service.ts` build and invoke these chains instead of embedding a wall of `if` statements.

## Other engineering practices

- **Service / repository separation**: `services/` hold business rules and permission checks; `repositories/` hold Prisma queries. Pages and Server Actions never call Prisma directly.
- **Domain errors** (`src/domain/errors.ts`): `ValidationError` / `ForbiddenError` / `NotFoundError` / `ConflictError` are thrown by services and turned into safe, translated messages by `toUserMessage()` — unexpected errors are logged server-side and never leak a stack trace to the client.
- **Server-side authorization everywhere**: route-level guards (`requireUser` / `requireRole`) protect pages; service methods re-check permissions independently, so a mistake in one layer doesn't become a security hole.
- **Typed, validated input**: every Server Action parses `FormData` through a Zod schema before it reaches a service.

## Database model

See [`docs/DATABASE.md`](docs/DATABASE.md) for the full entity list, relationships and a Mermaid ERD.

## Installation

Prerequisites: Node.js 20.9+, npm, a PostgreSQL server.

```bash
git clone <this-repo-url> gradeflow
cd gradeflow
npm install
```

## Environment variables

Copy `.env.example` to `.env` and fill in real values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/gradeflow?schema=public` |
| `SESSION_SECRET` | Random 32+ character secret used to sign session cookies. Generate with `openssl rand -base64 32`. |

Never commit a real `.env` file — it is git-ignored on purpose.

## Database setup

```bash
npm run db:generate     # generate the Prisma client
npm run db:migrate      # create the database schema (dev)
npm run db:seed         # load Hebrew demo data
```

For a production database, use `npm run db:migrate:deploy` instead of `db:migrate`.

## Running locally

```bash
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`.

## Demo accounts

Seeded by `npm run db:seed`. Passwords are bcrypt-hashed in the database; these are demo/fictional accounts only.

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@gradeflow.school` | `Admin123!` | Full system access |
| Teacher | `dana.levi@gradeflow.school` | `Teacher123!` | Teaches מתמטיקה, מדעי המחשב |
| Teacher | `yossi.cohen@gradeflow.school` | `Teacher123!` | Teaches אנגלית |

## Tests

```bash
npm run typecheck   # TypeScript
npm run lint         # ESLint
npm test             # Vitest unit tests
npm run build        # Production build
```

See [`docs/TESTING.md`](docs/TESTING.md) for the full test strategy and results.

## Deployment

Not deployed for this submission — the project runs locally against a PostgreSQL database (see above). The stack (Next.js + PostgreSQL + Prisma) is deploy-ready for a host such as Vercel with a managed Postgres provider (Supabase/Neon); `.github/workflows/ci.yml` keeps `main` green independently of any deployment target.

## GitHub

Repository: `gradeflow-advanced-software-project`

## License

Academic project — not licensed for production/commercial use.
