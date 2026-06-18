# Security Policy

## The model: nothing to breach

Signal is **100% client-side**. There is no backend, no database, and no account system.

- **No data is collected.** Your CSV is parsed in your browser and held only in page memory; it is discarded when you close or reload the tab.
- **Nothing is uploaded.** The file never leaves your device. Signal makes no calls to `graph.facebook.com`, `api.anthropic.com`, or any server we control.
- **No keys or credentials** are required or stored. The only external requests are to public CDNs for fonts and the CSV-parsing library — you can confirm this in your browser's Network panel.

Because no Signal-operated service touches your data, there is no server-side attack surface to compromise it.

## Scope

This policy covers the open-core engine and the static dashboard in this repository. The future hosted "live mode" (private shell with Meta API credentials) will ship with its own security documentation when it exists.

## Reporting a vulnerability

If you find a security issue — for example, a way Signal could leak the parsed CSV off-device, or a dependency risk — please report it privately:

- Open a **GitHub security advisory** (Security → Report a vulnerability), or
- Email the maintainer rather than filing a public issue.

Please include steps to reproduce and the impact. We'll acknowledge and respond as quickly as we can. Do not include real account data or secrets in a report.
