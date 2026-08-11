import { ValidationHandler } from "../ValidationHandler";
import { ValidationError } from "@/domain/errors";
import type { AssessmentLookupPort } from "../ports";
import type { AssessmentPublicationContext } from "./AssessmentPublicationContext";

/**
 * Business rule: the published portion of a course's grading scheme must
 * never exceed 100%. This runs whenever an assessment is published,
 * summing the weight of every other already-published assessment in the
 * course plus this one - preventing an invalid scheme from ever being
 * finalized, rather than only warning about it in the UI.
 */
export class WeightTotalValidationHandler extends ValidationHandler<AssessmentPublicationContext> {
  constructor(private readonly assessments: AssessmentLookupPort) {
    super();
  }

  protected async validate(context: AssessmentPublicationContext): Promise<void> {
    const otherPublishedWeight = await this.assessments.sumPublishedWeight(
      context.courseId,
      context.assessmentId,
    );
    const projectedTotal = round2(otherPublishedWeight + context.weight);

    if (projectedTotal > 100) {
      throw new ValidationError(
        `סכום המשקלים המפורסמים יעמוד על ${projectedTotal}% - סכום המשקלים חייב להיות 100% לכל היותר`,
      );
    }
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
