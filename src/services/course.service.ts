import { courseRepository } from "@/repositories/course.repository";
import { studentRepository } from "@/repositories/student.repository";
import { userRepository } from "@/repositories/user.repository";
import { ConflictError, ForbiddenError, NotFoundError } from "@/domain/errors";
import type { SessionUser } from "@/lib/auth/session";
import type { CourseInput } from "@/validation/course.schema";

function assertAdmin(actor: SessionUser) {
  if (actor.role !== "ADMIN") {
    throw new ForbiddenError("רק מנהל מערכת יכול לבצע פעולה זו");
  }
}

export const courseService = {
  /** Admins see every course; teachers only see the ones assigned to them. */
  listForActor(actor: SessionUser) {
    if (actor.role === "ADMIN") return courseRepository.findMany();
    return courseRepository.findManyForTeacher(actor.id);
  },

  async getByIdForActor(actor: SessionUser, id: string) {
    const course = await courseRepository.findById(id);
    if (!course) throw new NotFoundError("המקצוע לא נמצא");

    if (actor.role === "TEACHER") {
      const isAssigned = course.teacherCourses.some((tc) => tc.teacherId === actor.id);
      if (!isAssigned) {
        throw new ForbiddenError("אין לך הרשאה לצפות במקצוע זה");
      }
    }

    return course;
  },

  async create(actor: SessionUser, input: CourseInput) {
    assertAdmin(actor);

    const existing = await courseRepository.findByCode(input.code);
    if (existing) throw new ConflictError("קיים כבר מקצוע עם קוד זה");

    return courseRepository.create({
      name: input.name,
      code: input.code,
      schoolYear: input.schoolYear,
      description: input.description ?? null,
    });
  },

  async update(actor: SessionUser, id: string, input: CourseInput) {
    assertAdmin(actor);

    const existing = await courseRepository.findByCode(input.code);
    if (existing && existing.id !== id) {
      throw new ConflictError("קיים כבר מקצוע עם קוד זה");
    }

    return courseRepository.update(id, {
      name: input.name,
      code: input.code,
      schoolYear: input.schoolYear,
      description: input.description ?? null,
    });
  },

  async assignTeacher(actor: SessionUser, courseId: string, teacherId: string) {
    assertAdmin(actor);

    const teacher = await userRepository.findById(teacherId);
    if (!teacher || teacher.role !== "TEACHER") {
      throw new NotFoundError("המורה לא נמצא");
    }

    return courseRepository.assignTeacher(courseId, teacherId);
  },

  async removeTeacher(actor: SessionUser, courseId: string, teacherId: string) {
    assertAdmin(actor);
    return courseRepository.removeTeacher(courseId, teacherId);
  },

  async enrollStudent(actor: SessionUser, courseId: string, studentId: string) {
    assertAdmin(actor);

    const student = await studentRepository.findById(studentId);
    if (!student) throw new NotFoundError("התלמיד לא נמצא");

    return courseRepository.enrollStudent(courseId, studentId);
  },

  async unenrollStudent(actor: SessionUser, courseId: string, studentId: string) {
    assertAdmin(actor);
    return courseRepository.unenrollStudent(courseId, studentId);
  },
};
