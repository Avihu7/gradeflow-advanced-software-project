# Project Report — GradeFlow

**Course:** Advanced Topics in Software Development (נושאים מתקדמים בפיתוח תוכנה)
**Project:** 03 — School Assessment Management Module (מערכת לניהול מודול הערכה בית ספרי)

## 1. Introduction

GradeFlow is a web-based information system for managing student assessments in a school setting. It lets a teacher define how a course's final grade is composed, enter grades, and produce reports, while an administrator manages the underlying data (teachers, students, courses, and who is assigned/enrolled where). Beyond the functional requirement, the project is built to visibly demonstrate software-engineering practice appropriate to an advanced course: a layered architecture, an ORM-backed relational schema, and three specific design patterns (Singleton, Strategy, Chain of Responsibility) used in real application flows rather than as isolated examples.

## 2. Problem definition

Grading in a school involves several people (teachers, administrators) and several kinds of correctness that must all hold simultaneously:

- A grading scheme (the assessments and their weights) must be structurally valid — weights in range, and a *published* scheme's weights must never exceed 100%.
- A grade must belong to a student who is actually enrolled in the course, for an assessment that actually belongs to that course, within the valid 0–100 range.
- Only the teacher(s) assigned to a course (or an administrator) may modify that course's assessments or grades.
- A final grade must be computed consistently, and must clearly distinguish "no grades yet", "some grades recorded" (partial), and "complete" — never silently treating a missing grade as a zero.

A generic CRUD admin panel does not encode any of this; GradeFlow encodes it directly in the domain layer so it is enforced the same way everywhere, not re-implemented (and potentially forgotten) per screen.

## 3. Requirements

**Functional:**
- Manage teachers, students, courses, teacher assignments, and enrollment (admin)
- Manage assessments and grading structure per course, scoped to assigned courses (teacher)
- Enter and update grades, with 0–100 validation
- Compute and display final grades (weighted average)
- Course and per-student grade reports, including a printable report card

**Non-functional:**
- Server-side enforcement of authorization (not merely hidden UI)
- Hashed passwords, signed sessions, no secrets in source control
- Hebrew, RTL, responsive interface suitable for real use
- Automated tests for the grading and validation logic
- Clean TypeScript, lint-clean, production build passing

## 4. Users

Two roles, both authenticated (no public self-registration):

- **Admin** — manages teachers, students, courses, teacher-course assignment, enrollment; can view any report.
- **Teacher** — sees only the courses assigned to them; manages assessments and grades for those courses; can view reports for their own courses' students only.

## 5. Use cases (representative)

1. *Admin creates a course and assigns a teacher* → Course + TeacherCourse created; the course now appears in that teacher's dashboard and course list.
2. *Admin enrolls a student in a course* → Enrollment created; the student appears in the course's grade sheets.
3. *Teacher defines a grading scheme* → creates several Assessments with weights; the UI shows the running total; publishing an assessment is rejected if the *published* total would exceed 100%.
4. *Teacher enters grades* → bulk grade sheet for one assessment, one row per enrolled student, saved through the grade-submission validation chain.
5. *Teacher/Admin views final grades* → weighted average computed live from published assessments, shown per student with a completeness badge.
6. *Anyone with permission prints a report card* → per-student, per-course breakdown, RTL, browser print/PDF.

## 6. Architecture

Layered: `app/` (routes + Server Actions) → `services/` (business rules & permissions) → `repositories/` (Prisma data access) → PostgreSQL, with two cross-cutting pattern modules (`patterns/grading`, `patterns/validation`) that services depend on. Full detail and a dependency diagram: [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md).

Route protection is a single async layout (`app/(app)/layout.tsx`) calling `requireUser()`/`requireRole()` on the server before rendering any authenticated page; every service method additionally re-checks the caller's permission independently, so authorization is enforced in two independent places, not just once at the route boundary.

## 7. Database

Seven core tables: `User`, `Student`, `Course`, `TeacherCourse`, `Enrollment`, `Assessment`, `Grade` — a normalized relational schema with unique constraints (email, student number, course code), cascading deletes, and indexes on the columns actually filtered on (role, active, className, schoolYear, courseId, studentId). Full detail and ERD: [`docs/DATABASE.md`](./DATABASE.md).

## 8. Design patterns

Three patterns, each solving a concrete problem (see [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md#design-patterns) and the README for full write-ups):

- **Singleton** (`src/lib/db.ts`) — one `PrismaClient` per process, cached across Next.js dev hot-reloads, avoiding connection-pool exhaustion.
- **Strategy** (`src/patterns/grading/`) — `GradingStrategy` interface with `WeightedAverageStrategy` (production default) and `SimpleAverageStrategy`; the grade service depends only on the interface.
- **Chain of Responsibility** (`src/patterns/validation/`) — two handler chains guard the two write paths that most need it: grade submission (`Authorization → Enrollment → Assessment → GradeRange`) and assessment publication (`Authorization → WeightTotal`).

## 9. SOLID principles

- **Single Responsibility** — repositories only query; services only hold business rules; validation handlers each check exactly one thing; UI components are small and composable.
- **Open/Closed** — a new grading policy can be added by writing a new `GradingStrategy` implementation and registering it in the factory, without touching `grade.service.ts` or any UI code. A new validation rule is a new handler appended to a chain.
- **Liskov Substitution** — any `GradingStrategy` is interchangeable wherever the interface type is used (proven by `SimpleAverageStrategy` being usable everywhere `WeightedAverageStrategy` is).
- **Interface Segregation** — the validation chain depends on narrow ports (`TeacherCourseLookupPort`, `EnrollmentLookupPort`, `AssessmentLookupPort`) rather than a wide repository interface, so tests only need to fake the three methods actually used.
- **Dependency Inversion** — `patterns/validation` depends on port *interfaces*, not on concrete Prisma repositories; the concrete adapters are wired in the service layer (`services/validationPorts.ts`).

## 10. Testing

Vitest unit tests (34 tests, 4 files) cover the grading Strategy, the Zod validation boundaries, both Chain of Responsibility pipelines (including handler *ordering*), and service-level authorization. Manual, browser-driven end-to-end verification covered every core screen against a real PostgreSQL database with seeded data, including a hand-checked weighted-average calculation and confirmed server-side (not just UI-level) authorization boundaries. Full detail and results: [`docs/TESTING.md`](./TESTING.md).

## 11. Deployment

The application runs locally against PostgreSQL for this submission (`npm run dev` + `npm run db:seed`); it was not deployed to a public host. The stack is deployment-ready for Vercel + a managed PostgreSQL provider without architectural changes, and `.github/workflows/ci.yml` validates every push/PR (install, Prisma generate, lint, typecheck, test, build) independently of any deployment target.

## 12. Conclusions

GradeFlow meets the functional requirement (teachers manage assessments/weights/grades for their courses; admins manage the surrounding data; final grades are computed and reportable) while also making the required advanced-software-development concepts genuinely load-bearing: removing the Strategy abstraction would mean re-deriving grade math per call site, and removing the Chain of Responsibility would mean re-writing the same four checks inline in two different services. The main scope trade-off was deployment: given the project's constraints for this submission, effort went into a correct, tested, locally-runnable system with real database persistence rather than a hosted demo; the codebase does not need re-architecting to deploy it later.
