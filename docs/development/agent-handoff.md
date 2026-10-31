# Agent handoff checklist

Use this after implementing a Hearth milestone (or any substantive change). **Do not commit or push** unless the user explicitly asks.

## Workspace scope

- **In scope:** everything under `hearth/` (this git repo).
- **Also in scope for milestones:** update the Hearth plan at **`~/.cursor/plans/local-first_ai_ide_243f6b80.plan.md`** (Cursor plan; sole roadmap source for Hearth).
- **Out of scope:** do not edit other sibling folders unless the user explicitly requests it.

## 1. Verify (TypeScript)

From the **repository root** (`hearth/`):

```bash
pnpm install   # if dependencies changed
pnpm run verify
```

`pnpm run verify` runs, in order:

1. `check:boundaries` — only `apps/vscode-extension` may import `vscode`
2. `lint` — ESLint across packages
3. `typecheck` — TypeScript
4. `test` — Vitest (unit tests)
5. `build` — Turborepo build (webview bundle + extension)

Fix failures before updating docs or suggesting a commit.

## 2. Update Cursor plan and docs (inside repo)

When a plan step is done:

1. Edit **`~/.cursor/plans/local-first_ai_ide_243f6b80.plan.md`** only. Do not add a copy of the plan under `hearth/docs/` and do not maintain a duplicate under other sibling directories.
2. Mark the step **Done**; update frontmatter todos if present.
3. Append a row to [`docs/decisions/implementation-log.md`](../decisions/implementation-log.md).
4. Update [`README.md`](../../README.md) if user-facing steps changed (F5, sidebar, commands).

## 3. Suggest git staging (no commit)

From **`hearth/`** (where `.git` lives):

```bash
git status
git add <paths>   # never node_modules/, dist/, .turbo/, .env
```

**Do not** `git commit` or `git push` unless the user requests it. Provide a **commit message suggestion** in the response (1–2 sentences, why-focused).

### Typical paths to stage

- `packages/**`, `apps/**`, `docs/**`, `scripts/**`
- Root configs: `package.json`, `pnpm-lock.yaml`, `eslint.config.js`, `turbo.json`, etc.
- Exclude build artifacts (should stay gitignored).

## 4. Report to the user

Include:

- What was implemented (milestone id)
- `pnpm run verify` result (pass/fail)
- Whether the Cursor plan file was updated
- Files to `git add` (Hearth repo only)
- Suggested commit message (subject + optional body)
