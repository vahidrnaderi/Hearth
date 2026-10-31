# ADR 0002: Local-first inference

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

Privacy and offline use require local models to be first-class, not a bolt-on URL field.

## Decision

Default configuration targets Ollama and local OpenAI-compatible servers (LM Studio, llama.cpp). Cloud providers are optional adapters. No request leaves the machine unless the user configures a non-local model profile for that role and supplies credentials.

## Consequences

- Model gateway must discover local servers and surface capabilities (tool calling, context limits).
- UI must show which role uses local vs remote inference.
- Optional cloud fallback is explicit opt-in, never silent.
