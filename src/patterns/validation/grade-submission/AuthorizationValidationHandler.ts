import { ValidationHandler } from "../ValidationHandler";
import { ForbiddenError } from "@/domain/errors";
import type { TeacherCourseLookupPort } from "../ports";
import type { GradeSubmissionContext } from "./GradeSubmissionContext";

/**
 * First link in the chain: is this user even allowed to touch grades for
 * this course? Admins may act on any course; teachers only on courses
 * they are assigned to. Everyone else is rejected before any further
 * (potentially expensive) checks run.
 */
export class AuthorizationValidationHandler extends ValidationHandler<GradeSubmissionContext> {
  constructor(private readonly teacherCourses: TeacherCourseLookupPort) {
    super();
  }

  protected async validate(context: GradeSubmissionContext): Promise<void> {
    const { actor, courseId } = context;

    if (actor.role === "ADMIN") return;

    if (actor.role === "TEACHER") {
      const assigned = await this.teacherCourses.isTeacherAssignedToCourse(
        actor.id,
        courseId,
      );
      if (assigned) return;
    }

    throw new ForbiddenError("אין לך הרשאה לערוך מקצוע זה");
  }
}
