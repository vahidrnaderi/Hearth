# Architecture docs

Architecture Decision Records (ADRs) for Hearth. New decisions get the next number in `docs/architecture/`.

## Package dependency rules

| Package | May depend on |
|---------|----------------|
| `shared` | (none) |
| `model-gateway` | `shared` |
| `tool-runtime` | `shared` |
| `context-engine` | `shared` |
| `storage` | `shared` |
| `agent-runtime` | `shared`, gateway/tool/context **interfaces** (via package deps) |
| `core` | `agent-runtime`, `storage`, other core packages |
| `apps/vscode-extension` | `core`, `@types/vscode` only in this app |
| `apps/webview` | `shared` UI contracts only (no `vscode`) |

Run `pnpm run check:boundaries` in CI and locally after changes.
