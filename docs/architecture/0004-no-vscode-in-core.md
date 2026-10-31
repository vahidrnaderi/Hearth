# ADR 0004: No vscode in core packages

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

Editor independence is the main architectural bet.

## Decision

Only `apps/vscode-extension` may import `vscode`. All other packages use interfaces implemented by host adapters. Enforced via ESLint `no-restricted-imports` on `packages/**` and `scripts/check-boundaries.mjs`.

## Consequences

- Slightly more boilerplate for adapters.
- Core packages are testable in Node without `@vscode/test-electron` for unit tests.
- Webview stays free of `vscode`; it messages the extension host.
