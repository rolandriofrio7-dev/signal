/**
 * CSV adapter (engine, open core — pure, no secrets, no network).
 *
 * Source adapter #2. Converges on the SAME clean-row contract that parse()
 * emits and that diagnose() + the dashboard consume, unchanged:
 *
 *     parseCsv(input) -> Promise<cleanRows[]>
 *     cleanRow = { campaign, objective, spend, impressions, reach, clicks,
 *                  result, result_type, revenue, roas, cost_per_result }
 *
 * Meta Ads Manager CSV exports are already flat (one row per campaign, plain
 * numeric columns), so the nested-actions API parser is NOT used here. We map
 * columns straight onto the clean row.
 *
 * Robustness: case-insensitive header matching with variants (Meta column
 * names drift); numeric strings stripped of "$" "," "%"; missing cells -> 0 or
 * null; never throws on data — only throws a typed CsvError when the export is
 * structurally unusable (no rows / no spend column), for the UI to phrase.
 *
 * Depends on PapaParse being present as a global (loaded via CDN in the page).
 */

export class CsvError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "CsvError";
    this.code = code;
  }
}

// field -> accepted header variants (matched case-insensitively, trimmed)
const COLUMNS = {
  campaign:    ["Campaign name", "Campaign", "Ad name", "Ad set name"],
  objective:   ["Objective", "Campaign objective"],
  spend:       ["Amount spent (USD)", "Amount spent", "Spend", "Cost"],
  impressions: ["Impressions"],
  reach:       ["Reach"],
  clicks:      ["Link clicks", "Inline link clicks", "Clicks (all)", "Clicks"],
  purchases:   ["Purchases", "Website purchases", "Purchases (conversions)"],
  leads:       ["Leads", "Leads (form)", "On-Facebook leads"],
  results:     ["Results"],
  revenue:     ["Purchases conversion value", "Conversion value",
                "Website purchases conversion value"],
  roas:        ["Purchase ROAS", "Purchase ROAS (return on ad spend)",
                "Website purchase ROAS", "ROAS"],
};

const norm = (s) => String(s ?? "").trim().toLowerCase();

/** Build { field: actualHeaderName | undefined } from the parsed header set. */
function resolveHeaders(headerList) {
  const present = new Map(headerList.map((h) => [norm(h), h])); // normalized -> real header
  const map = {};
  for (const [field, variants] of Object.entries(COLUMNS)) {
    for (const v of variants) {
      const real = present.get(norm(v));
      if (real) { map[field] = real; break; }
    }
  }
  return map;
}

/** "$3,200.50" -> 3200.5 ; "" -> null ; "5.1" -> 5.1 */
function num(raw) {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).replace(/[$,%\s]/g, "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Normalize Meta objective text to the keys used in config.js / fixtures.js. */
function normalizeObjective(text) {
  const t = norm(text);
  if (!t) return null;
  if (/(sale|conversion|purchase|catalog)/.test(t)) return "OUTCOME_SALES";
  if (/lead/.test(t)) return "OUTCOME_LEADS";
  if (/(aware|reach|brand|video|impression)/.test(t)) return "OUTCOME_AWARENESS";
  return null;
}

function buildRow(raw, hdr) {
  const get = (field) => (hdr[field] ? raw[hdr[field]] : undefined);

  const campaign = (get("campaign") ?? "").toString().trim() || null;
  const spend = num(get("spend")) ?? 0;
  const impressions = Math.round(num(get("impressions")) ?? 0);
  const reach = Math.round(num(get("reach")) ?? 0);
  const clicks = Math.round(num(get("clicks")) ?? 0);

  const purchases = num(get("purchases"));
  const leads = num(get("leads"));
  const results = num(get("results"));
  const revenue = num(get("revenue"));
  const roasCol = num(get("roas"));

  // objective: explicit text, else inferred from which columns carry signal
  let objective = normalizeObjective(get("objective"));
  if (!objective) {
    if (roasCol != null || revenue != null || purchases != null) objective = "OUTCOME_SALES";
    else if (leads != null) objective = "OUTCOME_LEADS";
    else objective = "OUTCOME_AWARENESS";
  }

  let result = null, result_type = null, rev = null, roas = null;
  if (objective === "OUTCOME_SALES") {
    result_type = "omni_purchase";
    result = purchases ?? results ?? null;
    rev = revenue ?? null;
    roas = roasCol ?? (rev != null && spend ? +(rev / spend).toFixed(4) : null);
  } else if (objective === "OUTCOME_LEADS") {
    result_type = "lead";
    result = leads ?? results ?? null;
  }
  // awareness: result_type stays null -> idle downstream

  const out = {
    campaign, objective, spend, impressions, reach, clicks,
    result, result_type, revenue: rev, roas,
  };
  if (result) out.cost_per_result = +(spend / result).toFixed(4);
  if (rev && spend) out.roas_calc = +(rev / spend).toFixed(4);
  return out;
}

function papa() {
  const P = (typeof window !== "undefined" && window.Papa) || (typeof Papa !== "undefined" && Papa);
  if (!P) throw new CsvError("no_papaparse", "CSV parser failed to load. Check your connection and reload.");
  return P;
}

/**
 * @param {File|string} input  a File from a drop/picker, or raw CSV text.
 * @returns {Promise<Array<object>>} clean metric rows
 */
export function parseCsv(input) {
  return new Promise((resolve, reject) => {
    papa().parse(input, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (res) => {
        try {
          const fields = res.meta?.fields ?? [];
          const hdr = resolveHeaders(fields);
          if (!hdr.spend) {
            throw new CsvError(
              "no_spend",
              "Couldn't find a spend column — re-export from Ads Manager with Amount Spent included."
            );
          }
          const rows = (res.data || []).filter(
            (r) => r && Object.values(r).some((v) => String(v ?? "").trim() !== "")
          );
          if (rows.length === 0) {
            throw new CsvError("empty", "That file has no campaign rows. Export at the campaign level and try again.");
          }
          resolve(rows.map((r) => buildRow(r, hdr)));
        } catch (e) {
          reject(e instanceof CsvError ? e : new CsvError("parse", e.message));
        }
      },
      error: (err) => reject(new CsvError("parse", err?.message || "Could not read that CSV file.")),
    });
  });
}
