import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export const assessmentRepository = {
  findManyByCourse(courseId: string) {
    return db.assessment.findMany({
      where: { courseId },
      orderBy: { date: "asc" },
    });
  },

  findById(id: string) {
    return db.assessment.findUnique({ where: { id } });
  },

  findInCourse(id: string, courseId: string) {
    return db.assessment.findFirst({ where: { id, courseId } });
  },

  count() {
    return db.assessment.count();
  },

  countForCourses(courseIds: string[]) {
    return db.assessment.count({ where: { courseId: { in: courseIds } } });
  },

  create(data: Prisma.AssessmentCreateInput) {
    return db.assessment.create({ data });
  },

  update(id: string, data: Prisma.AssessmentUpdateInput) {
    return db.assessment.update({ where: { id }, data });
  },

  delete(id: string) {
    return db.assessment.delete({ where: { id } });
  },

  setPublished(id: string, published: boolean) {
    return db.assessment.update({ where: { id }, data: { published } });
  },

  async sumWeight(courseId: string, excludeAssessmentId?: string) {
    const result = await db.assessment.aggregate({
      where: {
        courseId,
        ...(excludeAssessmentId ? { id: { not: excludeAssessmentId } } : {}),
      },
      _sum: { weight: true },
    });
    return Number(result._sum.weight ?? 0);
  },

  async sumPublishedWeight(courseId: string, excludeAssessmentId?: string) {
    const result = await db.assessment.aggregate({
      where: {
        courseId,
        published: true,
        ...(excludeAssessmentId ? { id: { not: excludeAssessmentId } } : {}),
      },
      _sum: { weight: true },
    });
    return Number(result._sum.weight ?? 0);
  },
};
