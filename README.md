# Hearth

**Your code. Your models. Your home.**

Local-first, model-agnostic AI coding assistant. The VS Code extension is the UI shell; agent, model gateway, indexing, and tools live in TypeScript packages that do not import `vscode`.

This repository is **self-contained**. Milestone tracking lives in the Cursor plan `~/.cursor/plans/local-first_ai_ide_243f6b80.plan.md`; do not duplicate that roadmap here.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) 9+

## Commands

```bash
pnpm install
pnpm run verify   # boundaries + lint + typecheck + test + build
```

Or run steps individually: `check:boundaries`, `typecheck`, `test`, `build`.

Agents: see [AGENTS.md](AGENTS.md) and [docs/development/agent-handoff.md](docs/development/agent-handoff.md).

## Try the extension

1. From repo root: `pnpm run build`.
2. Open **`apps/vscode-extension`** as the VS Code workspace folder (File → Open Folder).
3. Press **F5** to launch the **Extension Development Host**.
4. Click the **Hearth** activity bar icon → **Chat** webview, or run **Hearth: Open Chat** / **Hearth: Show Core Info** from the Command Palette.

Send a message in the sidebar to exercise the M1-2 stub reply (no real model yet).

## Layout

See [docs/architecture/README.md](docs/architecture/README.md) and ADRs in the same folder.

## Milestone status

| Step | Status |
|------|--------|
| M1-1 Monorepo bootstrap | Done |
| M1-2 Extension + webview scaffold | Done |
| M1-3 Model gateway | Pending |
