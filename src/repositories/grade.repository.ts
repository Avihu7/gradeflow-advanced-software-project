import { db } from "@/lib/db";

export const gradeRepository = {
  findByAssessment(assessmentId: string) {
    return db.grade.findMany({ where: { assessmentId } });
  },

  findByStudentInCourse(studentId: string, courseId: string) {
    return db.grade.findMany({
      where: { studentId, assessment: { courseId } },
      include: { assessment: true },
    });
  },

  findByCourse(courseId: string) {
    return db.grade.findMany({
      where: { assessment: { courseId } },
      include: { assessment: true },
    });
  },

  count() {
    return db.grade.count();
  },

  countForCourses(courseIds: string[]) {
    return db.grade.count({ where: { assessment: { courseId: { in: courseIds } } } });
  },

  average() {
    return db.grade.aggregate({ _avg: { score: true } });
  },

  averageForCourses(courseIds: string[]) {
    return db.grade.aggregate({
      where: { assessment: { courseId: { in: courseIds } } },
      _avg: { score: true },
    });
  },

  /** Creates, updates, or deletes (when score is null) a single grade. */
  async upsertOrClear(params: {
    assessmentId: string;
    studentId: string;
    score: number | null;
    feedback?: string;
  }) {
    const { assessmentId, studentId, score, feedback } = params;

    if (score === null) {
      await db.grade
        .delete({ where: { assessmentId_studentId: { assessmentId, studentId } } })
        .catch(() => {
          // Nothing to delete - clearing an already-empty grade is a no-op.
        });
      return null;
    }

    return db.grade.upsert({
      where: { assessmentId_studentId: { assessmentId, studentId } },
      create: { assessmentId, studentId, score, feedback },
      update: { score, feedback },
    });
  },
};
