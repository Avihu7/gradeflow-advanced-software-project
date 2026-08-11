import { ValidationHandler } from "../ValidationHandler";
import { ForbiddenError } from "@/domain/errors";
import type { TeacherCourseLookupPort } from "../ports";
import type { AssessmentPublicationContext } from "./AssessmentPublicationContext";

/**
 * Same rule as the grade-submission chain's authorization handler (admins
 * act on any course, teachers only on their own), reused here for a
 * second real flow: publishing an assessment into the course's official
 * grading scheme.
 */
export class AuthorizationValidationHandler extends ValidationHandler<AssessmentPublicationContext> {
  constructor(private readonly teacherCourses: TeacherCourseLookupPort) {
    super();
  }

  protected async validate(context: AssessmentPublicationContext): Promise<void> {
    const { actor, courseId } = context;

    if (actor.role === "ADMIN") return;

    if (actor.role === "TEACHER") {
      const assigned = await this.teacherCourses.isTeacherAssignedToCourse(
        actor.id,
        courseId,
      );
      if (assigned) return;
    }

    throw new ForbiddenError("אין לך הרשאה לפרסם הערכה במקצוע זה");
  }
}
