/**
 * Narrow read-only ports the validation handlers depend on.
 *
 * The handlers only need to ask three yes/no-ish questions of the data
 * layer. Depending on these small interfaces (rather than importing the
 * repositories directly) keeps the validation chain decoupled from how
 * data access is implemented and easy to unit test with in-memory fakes.
 */
export interface TeacherCourseLookupPort {
  isTeacherAssignedToCourse(teacherId: string, courseId: string): Promise<boolean>;
}

export interface EnrollmentLookupPort {
  isStudentEnrolledInCourse(studentId: string, courseId: string): Promise<boolean>;
}

export interface AssessmentLookupPort {
  findAssessmentInCourse(
    assessmentId: string,
    courseId: string,
  ): Promise<{ id: string; weight: number; published: boolean } | null>;

  sumPublishedWeight(courseId: string, excludeAssessmentId?: string): Promise<number>;
}
