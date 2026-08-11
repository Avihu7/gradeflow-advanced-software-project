import { ValidationHandler } from "../ValidationHandler";
import { NotFoundError, ValidationError } from "@/domain/errors";
import type { AssessmentLookupPort } from "../ports";
import type { GradeSubmissionContext } from "./GradeSubmissionContext";

/**
 * Confirms the assessment exists and genuinely belongs to the course the
 * caller claims to be grading - guards against a stale/forged
 * `assessmentId` pointing at a different course.
 */
export class AssessmentValidationHandler extends ValidationHandler<GradeSubmissionContext> {
  constructor(private readonly assessments: AssessmentLookupPort) {
    super();
  }

  protected async validate(context: GradeSubmissionContext): Promise<void> {
    const assessment = await this.assessments.findAssessmentInCourse(
      context.assessmentId,
      context.courseId,
    );
    if (!assessment) {
      throw new NotFoundError("ההערכה לא נמצאה עבור מקצוע זה");
    }
    if (assessment.weight <= 0 || assessment.weight > 100) {
      throw new ValidationError("משקל ההערכה אינו תקין");
    }
  }
}
