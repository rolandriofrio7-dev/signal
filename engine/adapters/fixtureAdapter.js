/**
 * Fixture adapter (engine, open core).
 *
 * Implements the ONE Meta access port the rest of the system depends on:
 *
 *     fetchInsights(accountId, dateRange) -> Promise<rawRows>
 *
 * This adapter is pure and offline: it never touches graph.facebook.com and
 * holds no token. The real OAuth/proxy adapter lives in the private shell/ and
 * implements the same signature; the app swaps it in at a single call site.
 *
 * `rawRows` is the array of raw Insights rows, exactly as Meta's API returns
 * them under `response.data` — parser.js consumes this shape directly.
 */

import { RAW_INSIGHTS } from "../fixtures.js";

/**
 * @param {string} accountId   e.g. "act_1234567890" (ignored in fixture mode)
 * @param {{since:string, until:string}} [dateRange]  (ignored in fixture mode)
 * @returns {Promise<Array<object>>} raw Meta Insights rows
 */
export async function fetchInsights(accountId, dateRange) {
  // Return a deep copy so the engine/UI can never mutate the canned source.
  return RAW_INSIGHTS.map((row) => structuredClone(row));
}
