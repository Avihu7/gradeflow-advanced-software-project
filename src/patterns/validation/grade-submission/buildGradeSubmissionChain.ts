import type {
  AssessmentLookupPort,
  EnrollmentLookupPort,
  TeacherCourseLookupPort,
} from "../ports";
import { AuthorizationValidationHandler } from "./AuthorizationValidationHandler";
import { StudentEnrollmentValidationHandler } from "./StudentEnrollmentValidationHandler";
import { AssessmentValidationHandler } from "./AssessmentValidationHandler";
import { GradeRangeValidationHandler } from "./GradeRangeValidationHandler";
import type { ValidationHandler } from "../ValidationHandler";
import type { GradeSubmissionContext } from "./GradeSubmissionContext";

export interface GradeSubmissionChainDeps {
  teacherCourses: TeacherCourseLookupPort;
  enrollments: EnrollmentLookupPort;
  assessments: AssessmentLookupPort;
}

/**
 * Wires up the four handlers in order:
 *
 *   Authorization -> Enrollment -> Assessment -> GradeRange
 *
 * This is the order that fails fastest / cheapest first: reject
 * unauthorized callers before doing any other lookups, then confirm the
 * referenced records are consistent, and only then check the value
 * itself.
 */
export function buildGradeSubmissionChain(
  deps: GradeSubmissionChainDeps,
): ValidationHandler<GradeSubmissionContext> {
  const authorization = new AuthorizationValidationHandler(deps.teacherCourses);
  const enrollment = new StudentEnrollmentValidationHandler(deps.enrollments);
  const assessment = new AssessmentValidationHandler(deps.assessments);
  const gradeRange = new GradeRangeValidationHandler();

  authorization.setNext(enrollment).setNext(assessment).setNext(gradeRange);

  return authorization;
}
