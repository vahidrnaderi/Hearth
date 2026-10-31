# ADR 0006: Product branding

- **Status:** Accepted

## Context

The codebase used the placeholder name Project X and directory `project-x/`.

## Decision

- **Product name:** Hearth
- **Repository directory:** `hearth/`
- **Slug / publisher / commands:** `hearth` (e.g. `hearth.showInfo`, publisher `hearth`)
- **npm workspace scope:** `@hearth/*`
- **VS Code extension id:** `hearth-vscode` (display name: Hearth (Local AI))
- **Project rules file in user repos:** `.hearth/rules.md`

## Consequences

- Rename monorepo root from `project-x/` to `hearth/`.
- Update plans and docs to reference Hearth consistently.
