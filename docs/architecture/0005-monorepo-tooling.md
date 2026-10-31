# ADR 0005: Monorepo tooling

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

Multiple packages share types and must build in a consistent order.

## Decision

Use pnpm workspaces, TypeScript project references, esbuild per package, Vitest for tests, ESLint flat config, and Turborepo for task orchestration.

## Consequences

- Single `pnpm install` at repo root.
- Each package exposes `build`, `test`, `lint`, `typecheck` scripts consumed by turbo.
