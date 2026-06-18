/**
 * Scoring layer (engine, open core).
 * Turns parsed metrics into a normalized health index + a status that maps
 * directly to the design system's teal / amber / coral.
 *
 *   healthy  -> primary (teal)    #235750
 *   caution  -> secondary (amber) #7b5800
 *   critical -> tertiary (coral)  #8e2e24
 *   idle     -> outline (no data)
 */

import { healthScore } from "./parser.js";

export { healthScore };

/**
 * Classify a single value against a client's calibrated thresholds.
 * cfg = { mode: "higher_better" | "lower_better", healthy, critical }
 *   ROAS:  higher_better, healthy 4.0, critical 2.5  -> 3.2 == caution
 *   CPL:   lower_better,  healthy 50,  critical 120   -> $80 == caution
 */
export function classify(value, cfg) {
  if (value == null) return "idle";
  if (cfg.mode === "higher_better") {
    if (value >= cfg.healthy) return "healthy";
    if (value < cfg.critical) return "critical";
    return "caution";
  }
  if (value <= cfg.healthy) return "healthy";
  if (value > cfg.critical) return "critical";
  return "caution";
}

/**
 * Attach health index + status to a parsed row, given a per-client config.
 * The dashboard reads `status` to pick the pip color.
 */
export function diagnose(row, cfg) {
  // ROAS-led accounts grade on roas; cost-led accounts grade on cost_per_result.
  const metric = cfg.mode === "higher_better" ? row.roas : row.cost_per_result;
  const target = cfg.mode === "higher_better" ? cfg.healthy : cfg.healthy;
  const index = healthScore(
    metric ?? 0,
    target,
    cfg.mode === "lower_better"
  );
  return { ...row, status: classify(metric, cfg), index, graded_on: metric ?? null };
}
