/**
 * Default calibration (engine, open core — pure config, no secrets).
 *
 * The SINGLE source of grading thresholds. Both source adapters (CSV now,
 * Meta API later) converge on the clean-row contract and are graded against
 * this one config. The Calibration tab (next milestone) mutates this object
 * and re-renders — so keep it the only place thresholds are defined.
 *
 *   cfg = { mode: "higher_better" | "lower_better", healthy, critical }
 *   sales : ROAS, higher is better, healthy >= 4.0, critical < 2.5
 *   leads : CPL,  lower is better,  healthy <= 35,  critical > 60
 *   awareness : no gradable KPI -> null -> idle
 */

export const DEFAULT_THRESHOLDS = {
  OUTCOME_SALES:     { mode: "higher_better", healthy: 4.0, critical: 2.5 },
  OUTCOME_LEADS:     { mode: "lower_better",  healthy: 35,  critical: 60 },
  OUTCOME_AWARENESS: null,
  // legacy objective aliases map to the same configs
  CONVERSIONS:       { mode: "higher_better", healthy: 4.0, critical: 2.5 },
  LEAD_GENERATION:   { mode: "lower_better",  healthy: 35,  critical: 60 },
  BRAND_AWARENESS:   null,
};
