# ADR 0003: Custom agent runtime

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

We need full control over permissions, tool execution, and provider differences. Forking Cline/Roo/Continue would couple us to their extension architecture.

## Decision

Implement a small custom agent loop in `packages/agent-runtime`: session state, tool registry, permission checks, iteration limits, cancellation. Study open-source agents for patterns; do not depend on them as libraries.

## Consequences

- More initial work than wrapping an existing extension.
- Agent runtime stays reusable in CLI or Electron later.
- M1 starts read-only (Ask mode only).
