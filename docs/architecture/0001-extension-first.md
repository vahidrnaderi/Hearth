# ADR 0001: Extension-first delivery

- **Status:** Accepted

## Context

We want a Cursor-like experience with local models without maintaining a full editor fork on day one.

## Decision

Ship the first product as a VS Code extension. Implement AI logic in workspace packages that do not import `vscode`. A Code-OSS desktop IDE is a later milestone (M5).

## Consequences

- Faster path to a usable assistant.
- Must define host adapters (`WorkspaceFileSystem`, secrets, terminal) in the extension.
- Extension gallery distribution first; Open VSX when we ship a fork.
