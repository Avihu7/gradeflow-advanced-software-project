import { assessmentRepository } from "@/repositories/assessment.repository";
import { gradeRepository } from "@/repositories/grade.repository";
import { courseRepository } from "@/repositories/course.repository";
import { ForbiddenError, NotFoundError, ValidationError } from "@/domain/errors";
import { buildAssessmentPublicationChain } from "@/patterns/validation/assessment-publication/buildAssessmentPublicationChain";
import { teacherCourseLookup, assessmentLookup } from "./validationPorts";
import type { SessionUser } from "@/lib/auth/session";
import type { AssessmentInput } from "@/validation/assessment.schema";

async function assertCanManageCourse(actor: SessionUser, courseId: string) {
  if (actor.role === "ADMIN") return;
  if (actor.role === "TEACHER") {
    const assigned = await courseRepository.isTeacherAssigned(actor.id, courseId);
    if (assigned) return;
  }
  throw new ForbiddenError("אין לך הרשאה לערוך מקצוע זה");
}

export const assessmentService = {
  listByCourse(courseId: string) {
    return assessmentRepository.findManyByCourse(courseId);
  },

  async getById(id: string) {
    const assessment = await assessmentRepository.findById(id);
    if (!assessment) throw new NotFoundError("ההערכה לא נמצאה");
    return assessment;
  },

  async create(actor: SessionUser, input: AssessmentInput) {
    await assertCanManageCourse(actor, input.courseId);

    return assessmentRepository.create({
      title: input.title,
      type: input.type,
      weight: input.weight,
      date: input.date,
      description: input.description ?? null,
      published: false,
      course: { connect: { id: input.courseId } },
    });
  },

  async update(actor: SessionUser, id: string, input: AssessmentInput) {
    await assertCanManageCourse(actor, input.courseId);

    const existing = await assessmentRepository.findInCourse(id, input.courseId);
    if (!existing) throw new NotFoundError("ההערכה לא נמצאה עבור מקצוע זה");

    return assessmentRepository.update(id, {
      title: input.title,
      type: input.type,
      weight: input.weight,
      date: input.date,
      description: input.description ?? null,
    });
  },

  async delete(actor: SessionUser, id: string, courseId: string) {
    await assertCanManageCourse(actor, courseId);

    const grades = await gradeRepository.findByAssessment(id);
    if (grades.length > 0) {
      throw new ValidationError(
        "לא ניתן למחוק הערכה שכבר קיימים לה ציונים. יש למחוק תחילה את הציונים.",
      );
    }

    return assessmentRepository.delete(id);
  },

  /**
   * Publishing runs the assessment-publication Chain of Responsibility:
   * authorization, then the 100%-total business rule.
   */
  async setPublished(
    actor: SessionUser,
    id: string,
    courseId: string,
    published: boolean,
  ) {
    const assessment = await assessmentRepository.findInCourse(id, courseId);
    if (!assessment) throw new NotFoundError("ההערכה לא נמצאה עבור מקצוע זה");

    if (published) {
      const chain = buildAssessmentPublicationChain({
        teacherCourses: teacherCourseLookup,
        assessments: assessmentLookup,
      });
      await chain.handle({
        actor,
        courseId,
        assessmentId: id,
        weight: Number(assessment.weight),
      });
    } else {
      await assertCanManageCourse(actor, courseId);
    }

    return assessmentRepository.setPublished(id, published);
  },

  totalWeight(courseId: string) {
    return assessmentRepository.sumWeight(courseId);
  },
};
