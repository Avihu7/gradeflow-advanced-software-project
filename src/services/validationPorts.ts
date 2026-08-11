/**
 * Concrete adapters that satisfy the small ports the validation chain
 * handlers (`src/patterns/validation`) depend on, backed by the real
 * repositories. Kept in the service layer because only services know
 * how to translate Prisma's `Decimal` weight into a plain `number`.
 */
import { courseRepository } from "@/repositories/course.repository";
import { assessmentRepository } from "@/repositories/assessment.repository";
import type {
  AssessmentLookupPort,
  EnrollmentLookupPort,
  TeacherCourseLookupPort,
} from "@/patterns/validation/ports";

export const teacherCourseLookup: TeacherCourseLookupPort = {
  isTeacherAssignedToCourse: (teacherId, courseId) =>
    courseRepository.isTeacherAssigned(teacherId, courseId),
};

export const enrollmentLookup: EnrollmentLookupPort = {
  isStudentEnrolledInCourse: (studentId, courseId) =>
    courseRepository.isStudentEnrolled(studentId, courseId),
};

export const assessmentLookup: AssessmentLookupPort = {
  async findAssessmentInCourse(assessmentId, courseId) {
    const assessment = await assessmentRepository.findInCourse(assessmentId, courseId);
    if (!assessment) return null;
    return {
      id: assessment.id,
      weight: Number(assessment.weight),
      published: assessment.published,
    };
  },

  sumPublishedWeight: (courseId, excludeAssessmentId) =>
    assessmentRepository.sumPublishedWeight(courseId, excludeAssessmentId),
};
