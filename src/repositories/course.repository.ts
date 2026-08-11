import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export const courseRepository = {
  findMany() {
    return db.course.findMany({
      orderBy: [{ schoolYear: "desc" }, { name: "asc" }],
      include: {
        teacherCourses: { include: { teacher: true } },
        _count: { select: { enrollments: true, assessments: true } },
      },
    });
  },

  findManyForTeacher(teacherId: string) {
    return db.course.findMany({
      where: { teacherCourses: { some: { teacherId } } },
      orderBy: [{ schoolYear: "desc" }, { name: "asc" }],
      include: {
        teacherCourses: { include: { teacher: true } },
        _count: { select: { enrollments: true, assessments: true } },
      },
    });
  },

  findById(id: string) {
    return db.course.findUnique({
      where: { id },
      include: {
        teacherCourses: { include: { teacher: true } },
        enrollments: { include: { student: true } },
        assessments: { orderBy: { date: "asc" } },
      },
    });
  },

  findByCode(code: string) {
    return db.course.findUnique({ where: { code } });
  },

  findManyForStudent(studentId: string) {
    return db.course.findMany({
      where: { enrollments: { some: { studentId } } },
      orderBy: [{ schoolYear: "desc" }, { name: "asc" }],
      include: { teacherCourses: { include: { teacher: true } } },
    });
  },

  count() {
    return db.course.count();
  },

  create(data: Prisma.CourseCreateInput) {
    return db.course.create({ data });
  },

  update(id: string, data: Prisma.CourseUpdateInput) {
    return db.course.update({ where: { id }, data });
  },

  assignTeacher(courseId: string, teacherId: string) {
    return db.teacherCourse.upsert({
      where: { teacherId_courseId: { teacherId, courseId } },
      create: { teacherId, courseId },
      update: {},
    });
  },

  removeTeacher(courseId: string, teacherId: string) {
    return db.teacherCourse.delete({
      where: { teacherId_courseId: { teacherId, courseId } },
    });
  },

  enrollStudent(courseId: string, studentId: string) {
    return db.enrollment.upsert({
      where: { studentId_courseId: { studentId, courseId } },
      create: { studentId, courseId },
      update: {},
    });
  },

  unenrollStudent(courseId: string, studentId: string) {
    return db.enrollment.delete({
      where: { studentId_courseId: { studentId, courseId } },
    });
  },

  isTeacherAssigned(teacherId: string, courseId: string) {
    return db.teacherCourse
      .findUnique({ where: { teacherId_courseId: { teacherId, courseId } } })
      .then((row) => row !== null);
  },

  isStudentEnrolled(studentId: string, courseId: string) {
    return db.enrollment
      .findUnique({ where: { studentId_courseId: { studentId, courseId } } })
      .then((row) => row !== null);
  },
};
