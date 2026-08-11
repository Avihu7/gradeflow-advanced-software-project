import { describe, expect, it } from "vitest";
import { buildGradeSubmissionChain } from "@/patterns/validation/grade-submission/buildGradeSubmissionChain";
import { buildAssessmentPublicationChain } from "@/patterns/validation/assessment-publication/buildAssessmentPublicationChain";
import { ForbiddenError, NotFoundError, ValidationError } from "@/domain/errors";
import type {
  AssessmentLookupPort,
  EnrollmentLookupPort,
  TeacherCourseLookupPort,
} from "@/patterns/validation/ports";
import type { SessionUser } from "@/lib/auth/session";

const admin: SessionUser = { id: "admin-1", name: "Admin", email: "a@a.com", role: "ADMIN" };
const teacher: SessionUser = { id: "teacher-1", name: "Teacher", email: "t@t.com", role: "TEACHER" };
const otherTeacher: SessionUser = { id: "teacher-2", name: "Other", email: "o@o.com", role: "TEACHER" };

const COURSE_ID = "course-1";
const ASSESSMENT_ID = "assessment-1";
const STUDENT_ID = "student-1";

function fakePorts(overrides: Partial<{
  teacherAssigned: boolean;
  studentEnrolled: boolean;
  assessmentWeight: number;
  publishedWeightExcludingThis: number;
}> = {}) {
  const teacherCourses: TeacherCourseLookupPort = {
    isTeacherAssignedToCourse: async (teacherId, courseId) =>
      teacherId === teacher.id && courseId === COURSE_ID && (overrides.teacherAssigned ?? true),
  };

  const enrollments: EnrollmentLookupPort = {
    isStudentEnrolledInCourse: async () => overrides.studentEnrolled ?? true,
  };

  const assessments: AssessmentLookupPort = {
    findAssessmentInCourse: async (assessmentId, courseId) => {
      if (assessmentId !== ASSESSMENT_ID || courseId !== COURSE_ID) return null;
      return { id: ASSESSMENT_ID, weight: overrides.assessmentWeight ?? 30, published: false };
    },
    sumPublishedWeight: async () => overrides.publishedWeightExcludingThis ?? 0,
  };

  return { teacherCourses, enrollments, assessments };
}

describe("Grade submission Chain of Responsibility", () => {
  it("passes for an admin with a valid enrolled student and in-range score", async () => {
    const chain = buildGradeSubmissionChain(fakePorts());
    await expect(
      chain.handle({ actor: admin, courseId: COURSE_ID, assessmentId: ASSESSMENT_ID, studentId: STUDENT_ID, score: 85 }),
    ).resolves.toBeUndefined();
  });

  it("rejects a teacher who is not assigned to the course (authorization handler)", async () => {
    const chain = buildGradeSubmissionChain(fakePorts({ teacherAssigned: false }));
    await expect(
      chain.handle({ actor: teacher, courseId: COURSE_ID, assessmentId: ASSESSMENT_ID, studentId: STUDENT_ID, score: 85 }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects a teacher assigned to a different course entirely", async () => {
    const chain = buildGradeSubmissionChain(fakePorts());
    await expect(
      chain.handle({ actor: otherTeacher, courseId: COURSE_ID, assessmentId: ASSESSMENT_ID, studentId: STUDENT_ID, score: 85 }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects when the student is not enrolled in the course (enrollment handler)", async () => {
    const chain = buildGradeSubmissionChain(fakePorts({ studentEnrolled: false }));
    await expect(
      chain.handle({ actor: admin, courseId: COURSE_ID, assessmentId: ASSESSMENT_ID, studentId: STUDENT_ID, score: 85 }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects when the assessment does not belong to the course (assessment handler)", async () => {
    const chain = buildGradeSubmissionChain(fakePorts());
    await expect(
      chain.handle({ actor: admin, courseId: COURSE_ID, assessmentId: "wrong-assessment", studentId: STUDENT_ID, score: 85 }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects an out-of-range score (grade range handler) even for an admin", async () => {
    const chain = buildGradeSubmissionChain(fakePorts());
    await expect(
      chain.handle({ actor: admin, courseId: COURSE_ID, assessmentId: ASSESSMENT_ID, studentId: STUDENT_ID, score: 101 }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("allows a null score to explicitly clear a grade", async () => {
    const chain = buildGradeSubmissionChain(fakePorts());
    await expect(
      chain.handle({ actor: admin, courseId: COURSE_ID, assessmentId: ASSESSMENT_ID, studentId: STUDENT_ID, score: null }),
    ).resolves.toBeUndefined();
  });

  it("runs handlers in order: authorization fails before the range check even sees an invalid score", async () => {
    const chain = buildGradeSubmissionChain(fakePorts({ teacherAssigned: false }));
    await expect(
      chain.handle({ actor: teacher, courseId: COURSE_ID, assessmentId: ASSESSMENT_ID, studentId: STUDENT_ID, score: 999 }),
    ).rejects.toBeInstanceOf(ForbiddenError); // not ValidationError - authorization runs first
  });
});

describe("Assessment publication Chain of Responsibility", () => {
  it("allows publishing when the projected total is exactly 100%", async () => {
    const chain = buildAssessmentPublicationChain(
      fakePorts({ publishedWeightExcludingThis: 60 }),
    );
    await expect(
      chain.handle({ actor: admin, courseId: COURSE_ID, assessmentId: ASSESSMENT_ID, weight: 40 }),
    ).resolves.toBeUndefined();
  });

  it("rejects publishing when the projected total would exceed 100%", async () => {
    const chain = buildAssessmentPublicationChain(
      fakePorts({ publishedWeightExcludingThis: 80 }),
    );
    await expect(
      chain.handle({ actor: admin, courseId: COURSE_ID, assessmentId: ASSESSMENT_ID, weight: 30 }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects a teacher not assigned to the course before even checking weights", async () => {
    const chain = buildAssessmentPublicationChain(
      fakePorts({ teacherAssigned: false, publishedWeightExcludingThis: 0 }),
    );
    await expect(
      chain.handle({ actor: teacher, courseId: COURSE_ID, assessmentId: ASSESSMENT_ID, weight: 10 }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
