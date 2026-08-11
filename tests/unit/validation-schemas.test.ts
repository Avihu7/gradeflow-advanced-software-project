import { describe, expect, it } from "vitest";
import { gradeEntrySchema } from "@/validation/grade.schema";
import { assessmentSchema } from "@/validation/assessment.schema";

describe("gradeEntrySchema", () => {
  it("accepts scores within 0-100", () => {
    const result = gradeEntrySchema.safeParse({
      assessmentId: "a1",
      studentId: "s1",
      score: 87,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a negative score", () => {
    const result = gradeEntrySchema.safeParse({
      assessmentId: "a1",
      studentId: "s1",
      score: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a score above 100", () => {
    const result = gradeEntrySchema.safeParse({
      assessmentId: "a1",
      studentId: "s1",
      score: 101,
    });
    expect(result.success).toBe(false);
  });

  it("allows a null score (clearing a grade)", () => {
    const result = gradeEntrySchema.safeParse({
      assessmentId: "a1",
      studentId: "s1",
      score: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts boundary values 0 and 100", () => {
    expect(
      gradeEntrySchema.safeParse({ assessmentId: "a1", studentId: "s1", score: 0 }).success,
    ).toBe(true);
    expect(
      gradeEntrySchema.safeParse({ assessmentId: "a1", studentId: "s1", score: 100 }).success,
    ).toBe(true);
  });
});

describe("assessmentSchema (weight rules)", () => {
  const base = {
    courseId: "c1",
    title: "מבחן",
    type: "EXAM" as const,
    date: new Date("2026-01-01"),
  };

  it("accepts a weight strictly between 0 and 100", () => {
    expect(assessmentSchema.safeParse({ ...base, weight: 40 }).success).toBe(true);
  });

  it("accepts a weight of exactly 100", () => {
    expect(assessmentSchema.safeParse({ ...base, weight: 100 }).success).toBe(true);
  });

  it("rejects a weight of 0", () => {
    expect(assessmentSchema.safeParse({ ...base, weight: 0 }).success).toBe(false);
  });

  it("rejects a negative weight", () => {
    expect(assessmentSchema.safeParse({ ...base, weight: -10 }).success).toBe(false);
  });

  it("rejects a weight above 100", () => {
    expect(assessmentSchema.safeParse({ ...base, weight: 150 }).success).toBe(false);
  });
});
