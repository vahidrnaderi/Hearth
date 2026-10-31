# Hearth

**Your code. Your models. Your home.**

Local-first, model-agnostic AI coding assistant. The VS Code extension is the UI shell; agent, model gateway, indexing, and tools live in TypeScript packages that do not import `vscode`.

Reference implementation for lexical search and propose/accept: [`../slm_mvp_starter/`](../slm_mvp_starter/).

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) 9+

## Commands

```bash
pnpm install
pnpm run check:boundaries
pnpm run typecheck
pnpm run test
pnpm run build
```

## Try the extension

1. Open **`apps/vscode-extension`** as the VS Code workspace folder (File → Open Folder).
2. Press **F5** (or Run → Start Debugging) to launch an **Extension Development Host** window.
3. In that window, open the Command Palette and run **Hearth: Show Core Info**.

You should see a message with the core version and default model role (`agent`). If the build is stale, run `pnpm run build` from the repo root first, or use the default build task before F5 (see `apps/vscode-extension/.vscode/`).

## Layout

See [docs/architecture/README.md](docs/architecture/README.md) and ADRs in the same folder.

## Milestone status

| Step | Status |
|------|--------|
| M1-1 Monorepo bootstrap | Done |
| M1-2 Extension + webview scaffold | Pending |
| M1-3 Model gateway | Pending |
