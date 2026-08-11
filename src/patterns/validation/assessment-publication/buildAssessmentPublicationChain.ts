import type { AssessmentLookupPort, TeacherCourseLookupPort } from "../ports";
import { AuthorizationValidationHandler } from "./AuthorizationValidationHandler";
import { WeightTotalValidationHandler } from "./WeightTotalValidationHandler";
import type { ValidationHandler } from "../ValidationHandler";
import type { AssessmentPublicationContext } from "./AssessmentPublicationContext";

export interface AssessmentPublicationChainDeps {
  teacherCourses: TeacherCourseLookupPort;
  assessments: AssessmentLookupPort;
}

export function buildAssessmentPublicationChain(
  deps: AssessmentPublicationChainDeps,
): ValidationHandler<AssessmentPublicationContext> {
  const authorization = new AuthorizationValidationHandler(deps.teacherCourses);
  const weightTotal = new WeightTotalValidationHandler(deps.assessments);

  authorization.setNext(weightTotal);

  return authorization;
}
