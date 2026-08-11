/**
 * Demo seed data for GradeFlow.
 *
 * Creates:
 *  - 1 admin + 2 teacher accounts (hashed passwords, printed at the end)
 *  - 10 fictional students across a few classes
 *  - 3 courses (מתמטיקה, אנגלית, מדעי המחשב) for the current school year
 *  - Teacher assignments + student enrollments
 *  - A fully worked-out example in מתמטיקה: assessments whose published
 *    weights total exactly 100%, with every student graded, so the app
 *    has at least one complete, ready-to-demo grading scheme.
 *  - Partially-graded / partially-published data in the other two
 *    courses, to also show the "incomplete final grade" and "draft
 *    assessment" states.
 *
 * Run with: npm run db:seed
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const SCHOOL_YEAR = 'תשפ"ו';

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Seeding GradeFlow demo data...");

  // ---------------------------------------------------------------------
  // Clean slate (safe for a demo/dev database only)
  // ---------------------------------------------------------------------
  await db.grade.deleteMany();
  await db.assessment.deleteMany();
  await db.enrollment.deleteMany();
  await db.teacherCourse.deleteMany();
  await db.course.deleteMany();
  await db.student.deleteMany();
  await db.user.deleteMany();

  // ---------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------
  const admin = await db.user.create({
    data: {
      name: "אביעד בניטה",
      email: "admin@gradeflow.school",
      passwordHash: await hash("Admin123!"),
      role: "ADMIN",
    },
  });

  const danaLevi = await db.user.create({
    data: {
      name: "דנה לוי",
      email: "dana.levi@gradeflow.school",
      passwordHash: await hash("Teacher123!"),
      role: "TEACHER",
    },
  });

  const yossiCohen = await db.user.create({
    data: {
      name: "יוסי כהן",
      email: "yossi.cohen@gradeflow.school",
      passwordHash: await hash("Teacher123!"),
      role: "TEACHER",
    },
  });

  // ---------------------------------------------------------------------
  // Students
  // ---------------------------------------------------------------------
  const studentSeeds = [
    { firstName: "נועה", lastName: "אברהמי", studentNumber: "20001", className: "ט'1" },
    { firstName: "איתי", lastName: "בר-אור", studentNumber: "20002", className: "ט'1" },
    { firstName: "מאיה", lastName: "גולן", studentNumber: "20003", className: "ט'1" },
    { firstName: "עומר", lastName: "דהן", studentNumber: "20004", className: "ט'1" },
    { firstName: "שירה", lastName: "הראל", studentNumber: "20005", className: "ט'2" },
    { firstName: "יונתן", lastName: "וקנין", studentNumber: "20006", className: "ט'2" },
    { firstName: "טליה", lastName: "זיו", studentNumber: "20007", className: "ט'2" },
    { firstName: "דניאל", lastName: "חסון", studentNumber: "20008", className: "ט'2" },
    { firstName: "רותם", lastName: "טל", studentNumber: "20009", className: "ט'3" },
    { firstName: "אורי", lastName: "כרמלי", studentNumber: "20010", className: "ט'3" },
    { firstName: "הדר", lastName: "לביא", studentNumber: "20011", className: "ט'3" },
    { firstName: "עידן", lastName: "מזרחי", studentNumber: "20012", className: "ט'3" },
  ];

  const students = [];
  for (const s of studentSeeds) {
    students.push(
      await db.student.create({
        data: { ...s, active: true, email: `${s.studentNumber}@students.gradeflow.school` },
      }),
    );
  }
  // One inactive student to demonstrate the active/inactive filter.
  const inactiveStudent = await db.student.create({
    data: {
      firstName: "ליאור",
      lastName: "נחום",
      studentNumber: "20013",
      className: "ט'3",
      active: false,
    },
  });

  // ---------------------------------------------------------------------
  // Courses
  // ---------------------------------------------------------------------
  const math = await db.course.create({
    data: {
      name: "מתמטיקה",
      code: "MATH-9",
      schoolYear: SCHOOL_YEAR,
      description: "מתמטיקה לכיתה ט - אלגברה וגיאומטריה",
    },
  });

  const english = await db.course.create({
    data: {
      name: "אנגלית",
      code: "ENG-9",
      schoolYear: SCHOOL_YEAR,
      description: "אנגלית לכיתה ט - רמת בגרות 4/5 יחידות",
    },
  });

  const cs = await db.course.create({
    data: {
      name: "מדעי המחשב",
      code: "CS-10",
      schoolYear: SCHOOL_YEAR,
      description: "מבוא למדעי המחשב ותכנות בפייתון",
    },
  });

  // ---------------------------------------------------------------------
  // Teacher assignments
  // ---------------------------------------------------------------------
  await db.teacherCourse.createMany({
    data: [
      { teacherId: danaLevi.id, courseId: math.id },
      { teacherId: danaLevi.id, courseId: cs.id },
      { teacherId: yossiCohen.id, courseId: english.id },
    ],
  });

  // ---------------------------------------------------------------------
  // Enrollments - all 12 active students in Math, subsets in the others
  // ---------------------------------------------------------------------
  await db.enrollment.createMany({
    data: students.map((s) => ({ studentId: s.id, courseId: math.id })),
  });
  await db.enrollment.createMany({
    data: students.slice(0, 9).map((s) => ({ studentId: s.id, courseId: english.id })),
  });
  await db.enrollment.createMany({
    data: students.slice(4, 12).map((s) => ({ studentId: s.id, courseId: cs.id })),
  });

  // ---------------------------------------------------------------------
  // Math: a complete example - published assessments totaling 100%,
  // every enrolled student graded.
  // ---------------------------------------------------------------------
  const midterm = await db.assessment.create({
    data: {
      courseId: math.id,
      title: "מבחן אמצע - אלגברה",
      type: "EXAM",
      weight: 30,
      date: new Date("2026-01-20"),
      published: true,
    },
  });
  const finalExam = await db.assessment.create({
    data: {
      courseId: math.id,
      title: "מבחן סיום - אלגברה וגיאומטריה",
      type: "EXAM",
      weight: 40,
      date: new Date("2026-06-10"),
      published: true,
    },
  });
  const project = await db.assessment.create({
    data: {
      courseId: math.id,
      title: "עבודת חקר בגיאומטריה",
      type: "PROJECT",
      weight: 20,
      date: new Date("2026-04-01"),
      published: true,
    },
  });
  const participation = await db.assessment.create({
    data: {
      courseId: math.id,
      title: "השתתפות פעילה בכיתה",
      type: "PARTICIPATION",
      weight: 10,
      date: new Date("2026-06-15"),
      published: true,
    },
  });

  const mathScores: Record<string, [number, number, number, number]> = {};
  const baselines = [92, 78, 65, 88, 74, 95, 60, 83, 70, 99, 55, 90];
  students.forEach((student, i) => {
    const base = baselines[i % baselines.length];
    mathScores[student.id] = [
      clamp(base + rand(-5, 5)),
      clamp(base + rand(-8, 4)),
      clamp(base + rand(-3, 10)),
      clamp(base + rand(0, 10)),
    ];
  });

  for (const student of students) {
    const [s1, s2, s3, s4] = mathScores[student.id];
    await db.grade.create({
      data: { assessmentId: midterm.id, studentId: student.id, score: s1 },
    });
    await db.grade.create({
      data: { assessmentId: finalExam.id, studentId: student.id, score: s2 },
    });
    await db.grade.create({
      data: { assessmentId: project.id, studentId: student.id, score: s3 },
    });
    await db.grade.create({
      data: { assessmentId: participation.id, studentId: student.id, score: s4 },
    });
  }

  // ---------------------------------------------------------------------
  // English: two published assessments (60% of the scheme) with grades,
  // and one still-draft assessment - final grades will show as "partial".
  // ---------------------------------------------------------------------
  const quiz1 = await db.assessment.create({
    data: {
      courseId: english.id,
      title: "בוחן אוצר מילים",
      type: "QUIZ",
      weight: 20,
      date: new Date("2026-02-05"),
      published: true,
    },
  });
  const quiz2 = await db.assessment.create({
    data: {
      courseId: english.id,
      title: "בוחן הבנת הנקרא",
      type: "QUIZ",
      weight: 20,
      date: new Date("2026-03-12"),
      published: true,
    },
  });
  await db.assessment.create({
    data: {
      courseId: english.id,
      title: "פרויקט סיום - מצגת בעל-פה",
      type: "PROJECT",
      weight: 30,
      date: new Date("2026-06-20"),
      published: false, // still a draft: total published weight is 40%
    },
  });

  const englishStudents = students.slice(0, 9);
  for (const student of englishStudents) {
    const base = 70 + rand(-10, 20);
    await db.grade.create({
      data: { assessmentId: quiz1.id, studentId: student.id, score: clamp(base + rand(-5, 5)) },
    });
    // Leave the second quiz ungraded for a couple of students to show
    // the "missing grade" / partial-final-grade behavior clearly.
    if (student.studentNumber !== "20005" && student.studentNumber !== "20009") {
      await db.grade.create({
        data: { assessmentId: quiz2.id, studentId: student.id, score: clamp(base + rand(-8, 8)) },
      });
    }
  }

  // ---------------------------------------------------------------------
  // Computer Science: one published assessment, one draft with a weight
  // that would exceed 100% if published alongside it (left unpublished
  // on purpose to demonstrate the weight-validation rule).
  // ---------------------------------------------------------------------
  const csQuiz = await db.assessment.create({
    data: {
      courseId: cs.id,
      title: "בוחן יסודות פייתון",
      type: "QUIZ",
      weight: 25,
      date: new Date("2026-03-01"),
      published: true,
    },
  });
  await db.assessment.create({
    data: {
      courseId: cs.id,
      title: "פרויקט גמר - אפליקציה בפייתון",
      type: "PROJECT",
      weight: 85,
      date: new Date("2026-06-25"),
      published: false, // 25% + 85% > 100%, so this cannot be published as-is
    },
  });

  const csStudents = students.slice(4, 12);
  for (const student of csStudents) {
    await db.grade.create({
      data: { assessmentId: csQuiz.id, studentId: student.id, score: clamp(75 + rand(-15, 20)) },
    });
  }

  console.log("✅ Seed complete.");
  console.log("");
  console.log("Demo accounts (passwords are hashed in the database):");
  console.log(`  Admin:   ${admin.email} / Admin123!`);
  console.log(`  Teacher: ${danaLevi.email} / Teacher123!  (מתמטיקה, מדעי המחשב)`);
  console.log(`  Teacher: ${yossiCohen.email} / Teacher123!  (אנגלית)`);
  console.log("");
  console.log(
    `Students: ${students.length} active (${inactiveStudent.firstName} ${inactiveStudent.lastName} is inactive, for demo purposes)`,
  );
}

function rand(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
