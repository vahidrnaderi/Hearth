import { inferCapabilities } from "./capabilities.js";
import { composeModelId } from "./model-id.js";
import type {
  ChatMessage,
  ChatStreamChunk,
  FetchLike,
  ListedModel,
  OllamaGatewaySettings,
} from "./types.js";

function trimBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

export async function listOllamaModels(
  settings: OllamaGatewaySettings,
  fetchImpl: FetchLike,
): Promise<ListedModel[]> {
  if (!settings.enabled) {
    return [];
  }
  const base = trimBaseUrl(settings.baseUrl);
  const res = await fetchImpl(`${base}/api/tags`);
  if (!res.ok) {
    throw new Error(`Ollama listModels failed (${res.status})`);
  }
  const body = (await res.json()) as {
    models?: { name: string; model?: string }[];
  };
  const models = body.models ?? [];
  return models.map(entry => {
    const name = entry.name ?? entry.model ?? "unknown";
    return {
      id: composeModelId("ollama", name),
      name,
      provider: "ollama" as const,
      capabilities: inferCapabilities("ollama", name),
    };
  });
}

export async function* streamOllamaChat(
  settings: OllamaGatewaySettings,
  fetchImpl: FetchLike,
  model: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
): AsyncGenerator<ChatStreamChunk> {
  const base = trimBaseUrl(settings.baseUrl);
  const res = await fetchImpl(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, stream: true }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    yield {
      type: "error",
      message: `Ollama chat failed (${res.status})${text ? `: ${text.slice(0, 200)}` : ""}`,
    };
    return;
  }

  if (!res.body) {
    yield { type: "error", message: "Ollama chat returned no body" };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          continue;
        }
        let parsed: {
          message?: { content?: string };
          done?: boolean;
          error?: string;
        };
        try {
          parsed = JSON.parse(trimmed) as typeof parsed;
        } catch {
          continue;
        }
        if (parsed.error) {
          yield { type: "error", message: parsed.error };
          return;
        }
        const delta = parsed.message?.content;
        if (delta) {
          yield { type: "text_delta", text: delta };
        }
        if (parsed.done) {
          yield { type: "done", reason: "stop" };
          return;
        }
      }
    }
    yield { type: "done", reason: "stop" };
  } catch (err) {
    if (signal?.aborted) {
      yield { type: "done", reason: "cancel" };
      return;
    }
    const message = err instanceof Error ? err.message : String(err);
    yield { type: "error", message };
  } finally {
    reader.releaseLock();
  }
}
