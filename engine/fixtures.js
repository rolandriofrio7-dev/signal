/**
 * Fixtures (engine, open core — pure, no secrets, no network).
 *
 * RAW_INSIGHTS mimics the shape of a Meta Marketing API /insights response
 * (the `data` array). It is intentionally messy, to exercise parser.js's five
 * "silent corruptors":
 *   1. numbers arrive as strings            -> "spend": "3200.50"
 *   2. an action_type is simply absent       -> awareness row omits `actions`
 *   3. purchase has several aliases           -> omni_purchase / purchase / fb_pixel_purchase
 *   4. values nest under attribution windows  -> {"action_type":"...", "7d_click":"96"}
 *   5. awareness may have no result KPI at all -> objective OUTCOME_AWARENESS
 *
 * THRESHOLDS is the per-objective calibration the dashboard grades against.
 * In production this becomes per-CLIENT config; here one default client is enough.
 *   sales : ROAS, higher is better, healthy >= 4.0, critical < 2.5
 *   leads : CPL,  lower is better,  healthy <= 35,  critical > 60
 *   awareness : no gradable KPI -> idle
 */

// Thresholds live in one place (engine/config.js) so the Calibration tab has a
// single source to mutate. Re-exported here for back-compat with the fixture path.
import { DEFAULT_THRESHOLDS } from "./config.js";
export const THRESHOLDS = DEFAULT_THRESHOLDS;

export const ACCOUNT = { id: "act_fixture_001", name: "Northlight Studio (demo)" };

export const RAW_INSIGHTS = [
  // (1) SALES — strong. purchase_roas value present. -> ROAS 5.1 -> HEALTHY
  {
    campaign_name: "Black Friday — Full Catalog",
    objective: "OUTCOME_SALES",
    spend: "3200.50",
    impressions: "1842310",
    reach: "612904",
    inline_link_clicks: "28840",
    actions: [
      { action_type: "landing_page_view", value: "21044" },
      { action_type: "omni_purchase", value: "128" },
    ],
    action_values: [
      { action_type: "omni_purchase", value: "16322.55" },
    ],
    purchase_roas: [
      { action_type: "omni_purchase", value: "5.1" },
    ],
  },

  // (2) SALES — middling. ROAS 3.2 -> CAUTION  (acceptance check)
  // purchase result nests under an attribution window (corruptor #4).
  {
    campaign_name: "Evergreen Retargeting",
    objective: "OUTCOME_SALES",
    spend: "2750.00",
    impressions: "904220",
    reach: "288140",
    clicks: "15120",
    actions: [
      { action_type: "post_engagement", value: "4022" },
      { action_type: "omni_purchase", "7d_click": "96", "1d_view": "40" },
    ],
    action_values: [
      { action_type: "omni_purchase", "7d_click": "8800.00" },
    ],
    purchase_roas: [
      { action_type: "omni_purchase", value: "3.2" },
    ],
  },

  // (3) LEADS — efficient. spend 1400 / 50 leads = CPL $28 -> HEALTHY (<=35)
  {
    campaign_name: "Newsletter Signups",
    objective: "OUTCOME_LEADS",
    spend: "1400.00",
    impressions: "402118",
    reach: "210445",
    inline_link_clicks: "9610",
    actions: [
      { action_type: "lead", value: "50" },
      { action_type: "landing_page_view", value: "7340" },
    ],
  },

  // (4) LEADS — expensive. spend 1440 / 20 leads = CPL $72 -> CRITICAL (>60)
  {
    campaign_name: "Enterprise Demo Requests",
    objective: "OUTCOME_LEADS",
    spend: "1440.00",
    impressions: "188900",
    reach: "120300",
    inline_link_clicks: "3120",
    actions: [
      { action_type: "lead", value: "20" },
    ],
  },

  // (5) AWARENESS — no result KPI, `actions` omitted entirely -> IDLE
  {
    campaign_name: "Q3 Brand Lift",
    objective: "OUTCOME_AWARENESS",
    spend: "900.00",
    impressions: "2410880",
    reach: "1488200",
    clicks: "5210",
    // no `actions`, `action_values`, or `purchase_roas` — must not throw
  },
];
