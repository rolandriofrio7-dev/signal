/**
 * Meta Marketing API (Insights) response parser — JS port.
 * Same logic as meta_parser.py. Pure functions, no dependencies.
 * Works in the browser (Signal's no-backend path) or in Node.
 *
 * Handles the five silent corruptors:
 *  1. String values ("value": "5")            -> always Number().
 *  2. Missing action_type == zero, not error   -> default, never throw.
 *  3. purchase/omni_purchase/fb_pixel_purchase  -> pick ONE, never sum.
 *  4. action_attribution_windows nests          -> resolve the window.
 *  5. Awareness may omit `actions`              -> tolerate null/undefined.
 */

const OBJECTIVE_KPI = {
  OUTCOME_SALES: "omni_purchase",
  OUTCOME_LEADS: "lead",
  OUTCOME_TRAFFIC: "link_click",
  OUTCOME_ENGAGEMENT: "post_engagement",
  OUTCOME_APP_PROMOTION: "mobile_app_install",
  OUTCOME_AWARENESS: null,
  // legacy
  CONVERSIONS: "omni_purchase",
  LEAD_GENERATION: "lead",
  LINK_CLICKS: "link_click",
  POST_ENGAGEMENT: "post_engagement",
  APP_INSTALLS: "mobile_app_install",
  BRAND_AWARENESS: null,
  REACH: null,
};

const PURCHASE_TYPES = [
  "omni_purchase",
  "purchase",
  "offsite_conversion.fb_pixel_purchase",
];

const WINDOW_PRIORITY = ["7d_click", "1d_click", "28d_click", "1d_view", "7d_view"];

function num(x, dflt = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : dflt;
}

function getAction(items, actionType, dflt = 0) {
  if (!items || !actionType) return dflt;
  for (const item of items) {
    if (item.action_type !== actionType) continue;
    if ("value" in item) return num(item.value, dflt);
    for (const w of WINDOW_PRIORITY) if (w in item) return num(item[w], dflt);
    return dflt;
  }
  return dflt;
}

function getFirst(items, actionTypes, dflt = 0) {
  for (const t of actionTypes) {
    const v = getAction(items, t, null);
    if (v !== null) return v;
  }
  return dflt;
}

function parseRow(row) {
  const objective = row.objective || "";
  const kpiType = OBJECTIVE_KPI[objective] ?? null;
  const isSales = kpiType === "omni_purchase";

  const actions = row.actions || [];
  const actionValues = row.action_values || [];
  const roasList = row.purchase_roas || [];
  const spend = num(row.spend);

  let result = null, revenue = null, roas = null;
  if (isSales) {
    result = getFirst(actions, PURCHASE_TYPES);
    revenue = getFirst(actionValues, PURCHASE_TYPES);
    roas = getFirst(roasList, PURCHASE_TYPES) || null;
  } else if (kpiType) {
    result = getAction(actions, kpiType);
  }

  const out = {
    campaign: row.campaign_name ?? null,
    objective,
    spend,
    impressions: Math.round(num(row.impressions)),
    reach: Math.round(num(row.reach)),
    clicks: Math.round(num(row.inline_link_clicks ?? row.clicks)),
    result,
    result_type: kpiType,
    revenue,
    roas,
  };
  if (result) out.cost_per_result = +(spend / result).toFixed(4);
  if (revenue && spend) out.roas_calc = +(revenue / spend).toFixed(4);
  return out;
}

function parse(response) {
  const rows = Array.isArray(response) ? response : response.data || [];
  return rows.map(parseRow);
}

function healthScore(actual, target, lowerIsBetter = false, clamp = [0, 2]) {
  const [lo, hi] = clamp;
  let score;
  if (lowerIsBetter) {
    if (!actual) return hi;
    score = target / actual;
  } else {
    if (!target) return lo;
    score = actual / target;
  }
  return Math.max(lo, Math.min(hi, score));
}

export {
  OBJECTIVE_KPI, PURCHASE_TYPES,
  getAction, getFirst, parseRow, parse, healthScore,
};
