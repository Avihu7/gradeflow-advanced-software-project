import { studentRepository } from "@/repositories/student.repository";
import { courseRepository } from "@/repositories/course.repository";
import { assessmentRepository } from "@/repositories/assessment.repository";
import { gradeRepository } from "@/repositories/grade.repository";
import type { SessionUser } from "@/lib/auth/session";

export interface DashboardMetrics {
  activeStudents: number;
  courses: number;
  assessments: number;
  gradesEntered: number;
  averageGrade: number | null;
}

export const dashboardService = {
  /** Admins see school-wide metrics; teachers see metrics scoped to their own courses. */
  async getMetrics(actor: SessionUser): Promise<DashboardMetrics> {
    if (actor.role === "ADMIN") {
      const [activeStudents, courses, assessments, gradesEntered, avg] = await Promise.all([
        studentRepository.countActive(),
        courseRepository.count(),
        assessmentRepository.count(),
        gradeRepository.count(),
        gradeRepository.average(),
      ]);

      return {
        activeStudents,
        courses,
        assessments,
        gradesEntered,
        averageGrade: avg._avg.score !== null ? Number(avg._avg.score) : null,
      };
    }

    const teacherCourses = await courseRepository.findManyForTeacher(actor.id);
    const courseIds = teacherCourses.map((c) => c.id);

    if (courseIds.length === 0) {
      return { activeStudents: 0, courses: 0, assessments: 0, gradesEntered: 0, averageGrade: null };
    }

    const [activeStudents, assessments, gradesEntered, avg] = await Promise.all([
      studentRepository.countDistinctEnrolledInCourses(courseIds),
      assessmentRepository.countForCourses(courseIds),
      gradeRepository.countForCourses(courseIds),
      gradeRepository.averageForCourses(courseIds),
    ]);

    return {
      activeStudents,
      courses: courseIds.length,
      assessments,
      gradesEntered,
      averageGrade: avg._avg.score !== null ? Number(avg._avg.score) : null,
    };
  },
};
