import { describe, expect, it } from "vitest";
import { studentService } from "@/services/student.service";
import { courseService } from "@/services/course.service";
import { ForbiddenError } from "@/domain/errors";
import type { SessionUser } from "@/lib/auth/session";

// These tests exercise the permission checks at the top of each service
// method, which run - and throw - before any database access, so they
// are safe to run without a live database connection.

const teacher: SessionUser = { id: "t1", name: "Teacher", email: "t@t.com", role: "TEACHER" };

describe("studentService authorization (admin-only)", () => {
  it("rejects a teacher trying to create a student", async () => {
    await expect(
      studentService.create(teacher, {
        firstName: "א",
        lastName: "ב",
        studentNumber: "1",
        email: undefined,
        className: "י1",
        active: true,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects a teacher trying to activate/deactivate a student", async () => {
    await expect(studentService.setActive(teacher, "some-id", false)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});

describe("courseService authorization (admin-only operations)", () => {
  it("rejects a teacher trying to create a course", async () => {
    await expect(
      courseService.create(teacher, {
        name: "מקצוע",
        code: "X-1",
        schoolYear: 'תשפ"ו',
        description: undefined,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects a teacher trying to assign another teacher to a course", async () => {
    await expect(
      courseService.assignTeacher(teacher, "course-1", "teacher-2"),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects a teacher trying to enroll a student", async () => {
    await expect(
      courseService.enrollStudent(teacher, "course-1", "student-1"),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
