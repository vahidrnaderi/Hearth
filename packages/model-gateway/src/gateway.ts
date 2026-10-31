import { inferCapabilities } from "./capabilities.js";
import { parseModelId } from "./model-id.js";
import { listOllamaModels, streamOllamaChat } from "./ollama-provider.js";
import {
  listOpenAiCompatibleModels,
  streamOpenAiCompatibleChat,
} from "./openai-compatible-provider.js";
import type {
  ChatMessage,
  ChatStreamChunk,
  FetchLike,
  GatewayConfig,
  GatewayOptions,
  ListedModel,
  ModelCapabilities,
  SecretsReader,
} from "./types.js";

export class ModelGateway {
  private readonly config: GatewayConfig;
  private readonly secrets: SecretsReader;
  private readonly fetchImpl: FetchLike;

  constructor(options: GatewayOptions) {
    this.config = options.config;
    this.secrets = options.secrets;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  updateConfig(config: GatewayConfig): void {
    this.config.ollama = { ...config.ollama };
    this.config.openaiCompatible = { ...config.openaiCompatible };
  }

  async listModels(): Promise<ListedModel[]> {
    const results: ListedModel[] = [];
    const errors: string[] = [];

    if (this.config.ollama.enabled) {
      try {
        results.push(...(await listOllamaModels(this.config.ollama, this.fetchImpl)));
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err));
      }
    }

    if (this.config.openaiCompatible.enabled) {
      try {
        results.push(
          ...(await listOpenAiCompatibleModels(
            this.config.openaiCompatible,
            this.secrets,
            this.fetchImpl,
          )),
        );
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err));
      }
    }

    if (results.length === 0 && errors.length > 0) {
      throw new Error(errors.join("; "));
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  getCapabilities(modelId: string): ModelCapabilities {
    const { provider, providerModelId } = parseModelId(modelId);
    return inferCapabilities(provider, providerModelId);
  }

  async *streamChat(options: {
    modelId: string;
    messages: ChatMessage[];
    signal?: AbortSignal;
  }): AsyncGenerator<ChatStreamChunk> {
    const { provider, providerModelId } = parseModelId(options.modelId);

    if (provider === "ollama") {
      if (!this.config.ollama.enabled) {
        yield { type: "error", message: "Ollama provider is disabled in settings." };
        return;
      }
      yield* streamOllamaChat(
        this.config.ollama,
        this.fetchImpl,
        providerModelId,
        options.messages,
        options.signal,
      );
      return;
    }

    if (!this.config.openaiCompatible.enabled) {
      yield {
        type: "error",
        message: "OpenAI-compatible provider is disabled in settings.",
      };
      return;
    }

    yield* streamOpenAiCompatibleChat(
      this.config.openaiCompatible,
      this.secrets,
      this.fetchImpl,
      providerModelId,
      options.messages,
      options.signal,
    );
  }
}
