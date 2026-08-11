import { courseRepository } from "@/repositories/course.repository";
import { studentRepository } from "@/repositories/student.repository";
import { ForbiddenError, NotFoundError } from "@/domain/errors";
import { gradeService } from "./grade.service";
import { courseService } from "./course.service";
import type { SessionUser } from "@/lib/auth/session";

export const reportService = {
  /** Full grade report for a course: every enrolled student's final grade and assessment breakdown. */
  async getCourseReport(actor: SessionUser, courseId: string) {
    const course = await courseService.getByIdForActor(actor, courseId);
    const rows = await gradeService.getFinalGradesForCourse(courseId);
    return { course, rows };
  },

  /**
   * A printable report card: one student, across every course they are
   * enrolled in. Admins may view any student; teachers may only view
   * report cards for students enrolled in at least one course they
   * teach.
   */
  async getStudentReportCard(actor: SessionUser, studentId: string) {
    const student = await studentRepository.findById(studentId);
    if (!student) throw new NotFoundError("התלמיד לא נמצא");

    const courses = await courseRepository.findManyForStudent(studentId);

    const visibleCourses =
      actor.role === "ADMIN"
        ? courses
        : courses.filter((course) =>
            course.teacherCourses.some((tc) => tc.teacherId === actor.id),
          );

    if (actor.role === "TEACHER" && visibleCourses.length === 0) {
      throw new ForbiddenError("אין לך הרשאה לצפות בתעודת תלמיד זה");
    }

    const courseResults = await Promise.all(
      visibleCourses.map(async (course) => ({
        course,
        result: await gradeService.getFinalGradeForStudent(course.id, studentId),
      })),
    );

    return { student, courseResults };
  },
};
