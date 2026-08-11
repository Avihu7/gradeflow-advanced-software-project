import type {
  GradeCalculationResult,
  GradedAssessment,
  GradingStrategy,
} from "./GradingStrategy";

/**
 * Alternative strategy that ignores weights entirely and takes a plain
 * arithmetic mean of the recorded scores. Not used by default, but
 * demonstrates that the rest of the application is written against the
 * `GradingStrategy` abstraction, not against `WeightedAverageStrategy`
 * directly - swapping strategies requires no changes anywhere else.
 */
export class SimpleAverageStrategy implements GradingStrategy {
  readonly name = "ממוצע פשוט";

  calculate(assessments: GradedAssessment[]): GradeCalculationResult {
    const totalWeight = assessments.reduce((acc, a) => acc + a.weight, 0);
    const graded = assessments.filter(
      (a) => a.score !== null && a.score !== undefined,
    );

    if (graded.length === 0) {
      return {
        finalGrade: null,
        gradedWeight: 0,
        totalWeight: round2(totalWeight),
        isComplete: false,
      };
    }

    const average =
      graded.reduce((acc, a) => acc + (a.score as number), 0) / graded.length;

    return {
      finalGrade: round2(average),
      gradedWeight: round2(graded.reduce((acc, a) => acc + a.weight, 0)),
      totalWeight: round2(totalWeight),
      isComplete: graded.length === assessments.length && assessments.length > 0,
    };
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
