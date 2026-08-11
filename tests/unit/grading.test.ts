import { describe, expect, it } from "vitest";
import { WeightedAverageStrategy } from "@/patterns/grading/WeightedAverageStrategy";
import { SimpleAverageStrategy } from "@/patterns/grading/SimpleAverageStrategy";
import { getGradingStrategy } from "@/patterns/grading";

describe("WeightedAverageStrategy", () => {
  const strategy = new WeightedAverageStrategy();

  it("computes the textbook example: 85@40% + 90@40% + 100@20% = 90", () => {
    const result = strategy.calculate([
      { assessmentId: "a1", weight: 40, score: 85 },
      { assessmentId: "a2", weight: 40, score: 90 },
      { assessmentId: "a3", weight: 20, score: 100 },
    ]);

    expect(result.finalGrade).toBe(90);
    expect(result.isComplete).toBe(true);
    expect(result.totalWeight).toBe(100);
  });

  it("excludes missing grades instead of treating them as zero", () => {
    const result = strategy.calculate([
      { assessmentId: "a1", weight: 50, score: 80 },
      { assessmentId: "a2", weight: 50, score: null },
    ]);

    // Only the graded 50% counts, re-normalized: 80 * 50 / 50 = 80, not 40.
    expect(result.finalGrade).toBe(80);
    expect(result.isComplete).toBe(false);
    expect(result.gradedWeight).toBe(50);
  });

  it("returns null when nothing has been graded yet", () => {
    const result = strategy.calculate([
      { assessmentId: "a1", weight: 60, score: null },
      { assessmentId: "a2", weight: 40, score: undefined },
    ]);

    expect(result.finalGrade).toBeNull();
    expect(result.isComplete).toBe(false);
  });

  it("returns null for an empty assessment list", () => {
    const result = strategy.calculate([]);
    expect(result.finalGrade).toBeNull();
    expect(result.isComplete).toBe(false);
    expect(result.totalWeight).toBe(0);
  });

  it("handles a single fully-weighted assessment", () => {
    const result = strategy.calculate([{ assessmentId: "a1", weight: 100, score: 73.5 }]);
    expect(result.finalGrade).toBe(73.5);
    expect(result.isComplete).toBe(true);
  });
});

describe("SimpleAverageStrategy", () => {
  const strategy = new SimpleAverageStrategy();

  it("ignores weights and takes a plain mean of graded scores", () => {
    const result = strategy.calculate([
      { assessmentId: "a1", weight: 90, score: 60 },
      { assessmentId: "a2", weight: 10, score: 100 },
    ]);

    expect(result.finalGrade).toBe(80); // (60 + 100) / 2, weights ignored
  });
});

describe("getGradingStrategy (Strategy factory)", () => {
  it("defaults to the weighted-average strategy", () => {
    expect(getGradingStrategy().name).toBe(new WeightedAverageStrategy().name);
  });

  it("returns the simple-average strategy when requested", () => {
    expect(getGradingStrategy("simple-average").name).toBe(new SimpleAverageStrategy().name);
  });
});
