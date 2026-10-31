import type { ModelProviderKind } from "./types.js";

export function composeModelId(
  provider: ModelProviderKind,
  providerModelId: string,
): string {
  return `${provider}:${providerModelId}`;
}

export function parseModelId(compositeId: string): {
  provider: ModelProviderKind;
  providerModelId: string;
} {
  const idx = compositeId.indexOf(":");
  if (idx <= 0) {
    throw new Error(`Invalid model id (expected provider:model): ${compositeId}`);
  }
  const provider = compositeId.slice(0, idx) as ModelProviderKind;
  if (provider !== "ollama" && provider !== "openai-compatible") {
    throw new Error(`Unknown provider in model id: ${compositeId}`);
  }
  return { provider, providerModelId: compositeId.slice(idx + 1) };
}
