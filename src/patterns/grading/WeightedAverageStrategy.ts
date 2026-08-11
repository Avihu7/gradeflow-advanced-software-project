import type {
  GradeCalculationResult,
  GradedAssessment,
  GradingStrategy,
} from "./GradingStrategy";

/**
 * The default, production grading strategy.
 *
 * final = Σ(score_i × weight_i) / Σ(weight_i)  — over assessments that
 * currently have a recorded score.
 *
 * Missing grades are *excluded* from both the numerator and denominator
 * rather than treated as zero: a student with only 2 of 3 assessments
 * graded gets a grade computed from those 2, re-normalized against their
 * combined weight, and the result is flagged `isComplete: false` so the
 * UI can clearly mark it as a partial/in-progress grade instead of
 * silently presenting it as final.
 */
export class WeightedAverageStrategy implements GradingStrategy {
  readonly name = "ממוצע משוקלל";

  calculate(assessments: GradedAssessment[]): GradeCalculationResult {
    const totalWeight = round2(sum(assessments.map((a) => a.weight)));

    const graded = assessments.filter(
      (a) => a.score !== null && a.score !== undefined,
    );
    const gradedWeight = round2(sum(graded.map((a) => a.weight)));

    if (graded.length === 0 || gradedWeight === 0) {
      return {
        finalGrade: null,
        gradedWeight: 0,
        totalWeight,
        isComplete: false,
      };
    }

    const weightedSum = sum(graded.map((a) => (a.score as number) * a.weight));
    const finalGrade = round2(weightedSum / gradedWeight);

    return {
      finalGrade,
      gradedWeight,
      totalWeight,
      isComplete: graded.length === assessments.length && assessments.length > 0,
    };
  }
}

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
