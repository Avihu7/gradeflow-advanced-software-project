import { ValidationHandler } from "../ValidationHandler";
import { ValidationError } from "@/domain/errors";
import type { GradeSubmissionContext } from "./GradeSubmissionContext";

/**
 * Last link: the actual grade-range business rule. Kept last so it only
 * runs once we already know the caller is authorized and the
 * student/assessment/course relationship is valid.
 */
export class GradeRangeValidationHandler extends ValidationHandler<GradeSubmissionContext> {
  protected async validate(context: GradeSubmissionContext): Promise<void> {
    const { score } = context;

    // null explicitly clears a grade - that is allowed.
    if (score === null) return;

    if (score === undefined || Number.isNaN(score)) {
      throw new ValidationError("יש להזין ציון תקין");
    }

    if (score < 0 || score > 100) {
      throw new ValidationError("לא ניתן לשמור ציון מחוץ לטווח 0–100");
    }
  }
}
