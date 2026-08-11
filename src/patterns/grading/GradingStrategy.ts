/**
 * Design Pattern: STRATEGY
 * ------------------------------------------------------------------
 * The "how do we turn a set of (assessment weight, score) pairs into one
 * final grade" question has more than one reasonable answer - weighted
 * average is the default for GradeFlow, but a course might reasonably
 * want a plain (unweighted) average, or another scheme entirely in the
 * future.
 *
 * Rather than hard-coding a formula inside UI components or server
 * actions, we define a `GradingStrategy` interface and separate concrete
 * implementations. Callers (the grade service, dashboard, reports) only
 * ever depend on the interface, so a new grading policy can be added
 * without touching any existing call site - classic Open/Closed
 * Principle.
 */

export interface GradedAssessment {
  assessmentId: string;
  weight: number; // 0 < weight <= 100
  /** null/undefined = the student has no grade yet for this assessment. */
  score: number | null | undefined;
}

export interface GradeCalculationResult {
  /** Final grade rounded to 2 decimal places, or null if it cannot be computed. */
  finalGrade: number | null;
  /** Sum of the weights that were actually included (i.e. had a score). */
  gradedWeight: number;
  /** Sum of all weights in the scheme, graded or not. */
  totalWeight: number;
  /** True if every assessment in the scheme has a recorded score. */
  isComplete: boolean;
}

export interface GradingStrategy {
  /** Human-readable name, shown in reports/UI when relevant. */
  readonly name: string;

  calculate(assessments: GradedAssessment[]): GradeCalculationResult;
}
