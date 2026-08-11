import { studentRepository } from "@/repositories/student.repository";
import { ConflictError, ForbiddenError, NotFoundError } from "@/domain/errors";
import type { SessionUser } from "@/lib/auth/session";
import type { StudentInput } from "@/validation/student.schema";

function assertAdmin(actor: SessionUser) {
  if (actor.role !== "ADMIN") {
    throw new ForbiddenError("רק מנהל מערכת יכול לנהל תלמידים");
  }
}

export const studentService = {
  list(params: { search?: string; activeOnly?: boolean } = {}) {
    return studentRepository.findMany(params);
  },

  async getById(id: string) {
    const student = await studentRepository.findById(id);
    if (!student) throw new NotFoundError("התלמיד לא נמצא");
    return student;
  },

  async create(actor: SessionUser, input: StudentInput) {
    assertAdmin(actor);

    const existing = await studentRepository.findByStudentNumber(input.studentNumber);
    if (existing) {
      throw new ConflictError("קיים כבר תלמיד עם מספר תלמיד זה");
    }

    return studentRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      studentNumber: input.studentNumber,
      email: input.email ?? null,
      className: input.className,
      active: input.active,
    });
  },

  async update(actor: SessionUser, id: string, input: StudentInput) {
    assertAdmin(actor);

    const existing = await studentRepository.findByStudentNumber(input.studentNumber);
    if (existing && existing.id !== id) {
      throw new ConflictError("קיים כבר תלמיד עם מספר תלמיד זה");
    }

    return studentRepository.update(id, {
      firstName: input.firstName,
      lastName: input.lastName,
      studentNumber: input.studentNumber,
      email: input.email ?? null,
      className: input.className,
      active: input.active,
    });
  },

  async setActive(actor: SessionUser, id: string, active: boolean) {
    assertAdmin(actor);
    return studentRepository.setActive(id, active);
  },
};
