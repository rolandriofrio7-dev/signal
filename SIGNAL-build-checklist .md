# Signal — Build Checklist

**Goal:** ship a real, secure, live tool fast → open-source the engine after launch.
**Strategy:** three tracks run in parallel. Track A is slow paperwork (start it *today*). Track B is the fast code path to "live this week." Track C is the production shell that unlocks the public.

**The seam (never violate this):** `engine/` is pure and will be open-sourced. `shell/` holds every secret and stays private. `engine/` never imports from `shell/`. No credential ever touches `engine/`, not even in git history.

---

## ⚡ FAST PATH — live this week (do these first)
- [ ] Scaffold the repo with the engine/shell seam (Track B.1)
- [ ] Drop in the parser + fixture data → engine renders with zero Meta dependency (B.2–B.4)
- [ ] Build the dashboard UI against fixtures (B.5)
- [ ] Connect **your own** ad account via a System User token (Standard Access — no review) (C.2)
- [ ] Deploy engine + thin proxy (D)
- [ ] → You now have a live, real tool. Public OAuth + open-source come after.

---

## Track A — Meta access (START TODAY, it's the long pole)
- [ ] Create / confirm a **Meta Business Manager** account
- [ ] **Start Business Verification immediately** — it's separate from app review and slow; it gates Advanced Access
- [ ] Create a Meta app → choose type **Business** (only type with Marketing API)
- [ ] Add the **Marketing API** product to the app
- [ ] Link the app to your Business Manager (Settings → Advanced) — without this, tokens can't see ad-account data even with correct scopes
- [ ] Host a **Privacy Policy URL** + set App Domain (required even for setup — GitHub Pages is fine)
- [ ] Generate a **System User token** in Business Manager (non-expiring; the production-grade token)
- [ ] Rack up usage on your own account — the higher access tier needs ~500 Marketing API calls in 15 days to qualify
- [ ] Request **Advanced Access to `ads_read`** (separate justification; needed to serve *other people's* accounts)
- [ ] Set the app to **Live** mode (dev mode restricts access and breaks attribution)

## Track B — Engine (open core, no Meta dependency, fast)
- [ ] **B.1** Repo scaffold: `engine/` (will be public, `LICENSE` = MIT from commit #1) + `shell/` (private)
- [ ] **B.2** Drop in `meta_parser.py` / `metaParser.js` (already built + tested)
- [ ] **B.3** Define the port: `fetchInsights(accountId, dateRange) → rawRows` — the one interface the shell implements
- [ ] **B.4** Fixture adapter: returns the adversarial sample JSON, so the engine runs offline
- [ ] **B.5** Scoring + config: per-client `target` (ROAS or CPA) feeding `health_score()`
- [ ] **B.6** Dashboard UI (React): metrics table + health gauge, built entirely against fixtures
- [ ] **B.7** Keep a checked-in `fixtures/` sample so anyone can run the engine without a Meta account

## Track C — Shell (private, the actual business)
- [ ] **C.1** Thin backend (one serverless function is enough): the **proxy** that forwards Graph calls
- [ ] **C.2** Standard-Access adapter: proxy calls Graph with your System User token → live on your own accounts NOW
- [ ] **C.3** OAuth flow (Facebook Login): exchange the auth code **server-side**, never in the browser
- [ ] **C.4** Token vault: encrypted at rest + rotation; this is your core security obligation
- [ ] **C.5** Multi-tenant routing: scope every request to the right client's `accountId`
- [ ] **C.6** Snapshot/backfill job: re-pull a trailing 72h–28d window and overwrite (numbers attribute late)
- [ ] **C.7** Rate-limit handling: read `X-Business-Use-Case-Usage` header, throttle at 80%, back off on error 17
- [ ] **C.8** (later) Billing

## Track D — Deploy
- [ ] Host the engine UI (Netlify — you already use it)
- [ ] Host the proxy (serverless function)
- [ ] All secrets in host env vars, never in the repo
- [ ] Connect your own account → confirm real numbers match Ads Manager for the same date range + attribution window
- [ ] Onboard one warm client who adds you as admin (still Standard Access — no review needed)

## Track E — Open-source flip (only after live)
- [ ] Audit: confirm no secret ever touched `engine/` history (`git log -p` scan / fresh history if unsure)
- [ ] Add `README`, `LICENSE`, `CONTRIBUTING`, and the runnable fixture
- [ ] Self-host build uses **token-paste** (Standard Access, no review) — your open-source on-ramp
- [ ] Flip `engine/` repo to public. Done — the shell stays dark.

---

### The moat, stated plainly
Once the engine is public, the code isn't the moat. Your defensibility is the **verified Meta app** (a forker needs their own weeks-long review to serve clients), the hosted **token custody/trust**, and **onboarding**. Put effort there.

### Two auth models, two tiers (by design)
- **Hosted app** → OAuth / Advanced Access → serves the public.
- **Self-host build** → token-paste / Standard Access → no review, your open-source gift.
Same engine. Two adapters. Nothing wasted.
