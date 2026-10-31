import * as vscode from "vscode";
import type { GatewayConfig, SecretsReader } from "@hearth/model-gateway";

/** SecretStorage key for OpenAI-compatible API keys (never in settings JSON). */
export const OPENAI_COMPATIBLE_API_KEY_SECRET =
  "hearth.openaiCompatible.apiKey";

export function readGatewayConfig(): GatewayConfig {
  const cfg = vscode.workspace.getConfiguration("hearth");
  return {
    ollama: {
      enabled: cfg.get<boolean>("ollama.enabled", true),
      baseUrl: cfg.get<string>("ollama.baseUrl", "http://127.0.0.1:11434"),
    },
    openaiCompatible: {
      enabled: cfg.get<boolean>("openaiCompatible.enabled", false),
      baseUrl: cfg.get<string>(
        "openaiCompatible.baseUrl",
        "http://127.0.0.1:1234/v1",
      ),
      apiKeySecretKey: OPENAI_COMPATIBLE_API_KEY_SECRET,
    },
  };
}

export function createSecretsReader(
  context: vscode.ExtensionContext,
): SecretsReader {
  return {
    get: async (key: string) => (await context.secrets.get(key)) ?? undefined,
  };
}
