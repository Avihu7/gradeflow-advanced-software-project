import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export const studentRepository = {
  findMany(params: { search?: string; activeOnly?: boolean } = {}) {
    const { search, activeOnly } = params;
    const where: Prisma.StudentWhereInput = {
      ...(activeOnly ? { active: true } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { studentNumber: { contains: search, mode: "insensitive" } },
              { className: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    return db.student.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  },

  findById(id: string) {
    return db.student.findUnique({ where: { id } });
  },

  findByStudentNumber(studentNumber: string) {
    return db.student.findUnique({ where: { studentNumber } });
  },

  findManyByIds(ids: string[]) {
    return db.student.findMany({ where: { id: { in: ids } } });
  },

  countActive() {
    return db.student.count({ where: { active: true } });
  },

  countDistinctEnrolledInCourses(courseIds: string[]) {
    return db.student.count({
      where: { active: true, enrollments: { some: { courseId: { in: courseIds } } } },
    });
  },

  create(data: Prisma.StudentCreateInput) {
    return db.student.create({ data });
  },

  update(id: string, data: Prisma.StudentUpdateInput) {
    return db.student.update({ where: { id }, data });
  },

  setActive(id: string, active: boolean) {
    return db.student.update({ where: { id }, data: { active } });
  },

  findEnrolledInCourse(courseId: string) {
    return db.student.findMany({
      where: { enrollments: { some: { courseId } } },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  },

  findNotEnrolledInCourse(courseId: string) {
    return db.student.findMany({
      where: { active: true, enrollments: { none: { courseId } } },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  },
};
