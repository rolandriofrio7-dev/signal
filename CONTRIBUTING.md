# Contributing to Signal

Thanks for helping sharpen the instrument. Signal is small, static, and dependency-light on purpose — contributions should keep it that way.

## Run it

No build step. Serve the project root over HTTP and open it:

```bash
python -m http.server 8000
# open http://localhost:8000/   (use ?demo=fixtures to load sample campaigns)
```

ES modules won't load from `file://`, so always go through a server.

## The one rule: the engine stays pure

Everything in `engine/` is open-core and must remain **pure**:

- **No secrets, no tokens, no API keys** — ever, not even in a comment or commit.
- **No network calls** to ad platforms (`graph.facebook.com`, `api.anthropic.com`, etc.). Data sources are adapters that return the clean-row contract; the live/credentialed adapter belongs in the private shell, not here.
- **No imports from shell/host code.** The engine depends only on itself.

New data source? Add an adapter under `engine/adapters/` that maps input → the clean-row contract in `parser.js`. Don't touch `scoring.js` or the UI to make a source fit — converge on the contract instead.

## Pull requests

- One focused change per PR; describe the problem and the fix.
- Match the existing code style; don't reformat unrelated lines.
- **Don't alter the visual language** (colors, type, layout tokens) without a design reason called out in the PR.
- Test by hand: `Try sample data` must still render, and a **3.2-ROAS sales campaign must read CAUTION**.
- Confirm the Network panel shows **zero** calls to ad-platform or model APIs.

## Reporting bugs

Open an issue with the steps, what you expected, and what happened. If it's about parsing, attach a **de-identified** CSV snippet — never real account data or secrets.
