import { ValidationHandler } from "../ValidationHandler";
import { ValidationError } from "@/domain/errors";
import type { EnrollmentLookupPort } from "../ports";
import type { GradeSubmissionContext } from "./GradeSubmissionContext";

/**
 * Ensures the grade is being recorded for a student who is actually
 * enrolled in the course - prevents orphaned grades if a student is
 * removed from a course, and catches client bugs where the wrong
 * student id was submitted.
 */
export class StudentEnrollmentValidationHandler extends ValidationHandler<GradeSubmissionContext> {
  constructor(private readonly enrollments: EnrollmentLookupPort) {
    super();
  }

  protected async validate(context: GradeSubmissionContext): Promise<void> {
    const enrolled = await this.enrollments.isStudentEnrolledInCourse(
      context.studentId,
      context.courseId,
    );
    if (!enrolled) {
      throw new ValidationError("התלמיד אינו רשום למקצוע זה");
    }
  }
}
