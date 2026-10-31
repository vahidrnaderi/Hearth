import type { ModelCapabilities, ModelProviderKind } from "./types.js";

/** Heuristic defaults until provider-specific metadata is wired (M1-4+). */
export function inferCapabilities(
  provider: ModelProviderKind,
  modelName: string,
): ModelCapabilities {
  const n = modelName.toLowerCase();
  const toolCalling =
    n.includes("tool") ||
    n.includes("gpt-4") ||
    n.includes("qwen2.5") ||
    n.includes("deepseek");
  const vision =
    n.includes("vision") || n.includes("llava") || n.includes("-vl");

  return {
    streaming: true,
    toolCalling,
    vision,
    structuredOutput: false,
    maxContextTokens: provider === "ollama" ? 8192 : 128_000,
  };
}
