import type { GradingStrategy } from "./GradingStrategy";
import { WeightedAverageStrategy } from "./WeightedAverageStrategy";
import { SimpleAverageStrategy } from "./SimpleAverageStrategy";

export type { GradingStrategy, GradedAssessment, GradeCalculationResult } from "./GradingStrategy";
export { WeightedAverageStrategy } from "./WeightedAverageStrategy";
export { SimpleAverageStrategy } from "./SimpleAverageStrategy";

export type GradingStrategyName = "weighted-average" | "simple-average";

const strategies: Record<GradingStrategyName, GradingStrategy> = {
  "weighted-average": new WeightedAverageStrategy(),
  "simple-average": new SimpleAverageStrategy(),
};

/**
 * Factory returning the shared strategy instance for a given name.
 * `WeightedAverageStrategy` is the production default used everywhere
 * final grades are computed (final grades table, reports, dashboard
 * averages).
 */
export function getGradingStrategy(
  name: GradingStrategyName = "weighted-average",
): GradingStrategy {
  return strategies[name];
}
