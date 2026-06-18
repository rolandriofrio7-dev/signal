# SIGNAL

**Drop a Meta Ads Manager CSV export and get an instant, instrument-style diagnosis of every campaign** — healthy / caution / critical, graded against your own thresholds.

![Signal diagnostics dashboard](shots/diagnostics-desktop.png)

## Privacy guarantee

**Signal is 100% client-side. Your data never leaves your browser.**

There is no backend, no account, no upload, and no API key. The CSV you drop is parsed
in-page with JavaScript and discarded when you close the tab. The only network requests
the app makes are for **Google Fonts** and the **PapaParse** CSV library (both from public
CDNs) — never to `graph.facebook.com`, `api.anthropic.com`, or any server of ours. You can
verify this in your browser's Network panel.

## Run it

It's a static site — serve the folder over HTTP (ES modules don't load from `file://`):

```bash
# Python
python -m http.server 8754

# or Node
npx serve .
```

Then open <http://localhost:8754/dashboard.html> and click **Try sample data**, or drop
your own Meta Ads CSV export.

- `?demo=fixtures` — render the built-in fixture campaigns (used for testing the engine).

## Architecture

Signal is built around an **open core engine** and a (future) **private shell**, so the
engine can be open-sourced while credentials and hosted Meta access stay private.

```
engine/                     pure, no secrets, open-source-able
  parser.js                 Meta API Insights rows -> clean metrics row
  scoring.js                diagnose(row, cfg) -> { ...row, status, index }
  config.js                 DEFAULT_THRESHOLDS — the single grading source
  fixtures.js               sample raw rows for offline/demo
  adapters/
    csvAdapter.js           CSV export  -> clean rows   (this build)
    fixtureAdapter.js       canned rows -> clean rows   (offline demo)
dashboard.html              the UI: pick a source -> diagnose -> render
examples/                   a realistic sample Meta export
```

**One contract, many sources.** Every data source converges on the same clean metrics row:

```js
{ campaign, objective, spend, impressions, reach, clicks,
  result, result_type, revenue, roas, cost_per_result }
```

`diagnose()` and the dashboard UI consume that shape and never change. Adding a new source
(the Meta Marketing API next) is just another adapter that emits clean rows — the grading
and the UI are shared and untouched. The live adapter implements one port:

```js
fetchInsights(accountId, dateRange) -> rawRows
```

Thresholds live in **one place** (`engine/config.js`) so the upcoming Calibration tab has a
single source to mutate.

## Roadmap

- **Calibration tab** — sliders to tune per-objective healthy/critical thresholds live; the
  UI is already tab-ready.
- **Meta API live mode** — a private shell adapter (OAuth / System User token via a thin
  proxy) implementing `fetchInsights`, swapped in at a single call site. No engine changes.

## License

[MIT](LICENSE) © 2026 rolandriofrio7-dev
