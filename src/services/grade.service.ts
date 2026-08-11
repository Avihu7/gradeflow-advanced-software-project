import { gradeRepository } from "@/repositories/grade.repository";
import { assessmentRepository } from "@/repositories/assessment.repository";
import { studentRepository } from "@/repositories/student.repository";
import { NotFoundError } from "@/domain/errors";
import { buildGradeSubmissionChain } from "@/patterns/validation/grade-submission/buildGradeSubmissionChain";
import { teacherCourseLookup, enrollmentLookup, assessmentLookup } from "./validationPorts";
import { getGradingStrategy, type GradedAssessment } from "@/patterns/grading";
import type { SessionUser } from "@/lib/auth/session";

function chain() {
  return buildGradeSubmissionChain({
    teacherCourses: teacherCourseLookup,
    enrollments: enrollmentLookup,
    assessments: assessmentLookup,
  });
}

export const gradeService = {
  /** One row per student enrolled in the assessment's course, with their current score (if any). */
  async getGradeSheet(courseId: string, assessmentId: string) {
    const assessment = await assessmentRepository.findInCourse(assessmentId, courseId);
    if (!assessment) throw new NotFoundError("ההערכה לא נמצאה עבור מקצוע זה");

    const [students, grades] = await Promise.all([
      studentRepository.findEnrolledInCourse(courseId),
      gradeRepository.findByAssessment(assessmentId),
    ]);

    const gradeByStudent = new Map(grades.map((g) => [g.studentId, g]));

    return {
      assessment,
      rows: students.map((student) => ({
        student,
        grade: gradeByStudent.get(student.id) ?? null,
      })),
    };
  },

  /** Validates and saves (or clears) a single student's grade for one assessment. */
  async submitGrade(
    actor: SessionUser,
    params: {
      courseId: string;
      assessmentId: string;
      studentId: string;
      score: number | null;
      feedback?: string;
    },
  ) {
    await chain().handle({
      actor,
      courseId: params.courseId,
      assessmentId: params.assessmentId,
      studentId: params.studentId,
      score: params.score,
    });

    return gradeRepository.upsertOrClear({
      assessmentId: params.assessmentId,
      studentId: params.studentId,
      score: params.score,
      feedback: params.feedback,
    });
  },

  /** Validates and saves an entire grade sheet (one assessment, many students) in one call. */
  async submitBulkGrades(
    actor: SessionUser,
    params: {
      courseId: string;
      assessmentId: string;
      entries: Array<{ studentId: string; score: number | null; feedback?: string }>;
    },
  ) {
    const validatedChain = chain();

    for (const entry of params.entries) {
      await validatedChain.handle({
        actor,
        courseId: params.courseId,
        assessmentId: params.assessmentId,
        studentId: entry.studentId,
        score: entry.score,
      });
    }

    const results = [];
    for (const entry of params.entries) {
      results.push(
        await gradeRepository.upsertOrClear({
          assessmentId: params.assessmentId,
          studentId: entry.studentId,
          score: entry.score,
          feedback: entry.feedback,
        }),
      );
    }
    return results;
  },

  /**
   * Final grades for every student enrolled in a course, computed from
   * *published* assessments only, via the default (weighted-average)
   * GradingStrategy.
   */
  async getFinalGradesForCourse(courseId: string) {
    const [students, assessments, grades] = await Promise.all([
      studentRepository.findEnrolledInCourse(courseId),
      assessmentRepository.findManyByCourse(courseId),
      gradeRepository.findByCourse(courseId),
    ]);

    const published = assessments.filter((a) => a.published);
    const strategy = getGradingStrategy("weighted-average");

    return students.map((student) => {
      const studentGrades = grades.filter((g) => g.studentId === student.id);
      const gradeByAssessment = new Map(studentGrades.map((g) => [g.assessmentId, g]));

      const gradedAssessments: GradedAssessment[] = published.map((a) => {
        const grade = gradeByAssessment.get(a.id);
        return {
          assessmentId: a.id,
          weight: Number(a.weight),
          score: grade ? Number(grade.score) : null,
        };
      });

      const result = strategy.calculate(gradedAssessments);

      return {
        student,
        perAssessment: published.map((a) => {
          const grade = gradeByAssessment.get(a.id);
          return {
            assessment: a,
            score: grade ? Number(grade.score) : null,
          };
        }),
        ...result,
      };
    });
  },

  async getFinalGradeForStudent(courseId: string, studentId: string) {
    const all = await gradeService.getFinalGradesForCourse(courseId);
    const row = all.find((r) => r.student.id === studentId);
    if (!row) throw new NotFoundError("התלמיד אינו רשום למקצוע זה");
    return row;
  },
};
