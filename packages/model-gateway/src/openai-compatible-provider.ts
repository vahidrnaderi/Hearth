import { inferCapabilities } from "./capabilities.js";
import { composeModelId } from "./model-id.js";
import type {
  ChatMessage,
  ChatStreamChunk,
  FetchLike,
  ListedModel,
  OpenAiCompatibleGatewaySettings,
  SecretsReader,
} from "./types.js";

function trimBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

export async function listOpenAiCompatibleModels(
  settings: OpenAiCompatibleGatewaySettings,
  secrets: SecretsReader,
  fetchImpl: FetchLike,
): Promise<ListedModel[]> {
  if (!settings.enabled) {
    return [];
  }
  const base = trimBaseUrl(settings.baseUrl);
  const headers = await buildAuthHeaders(settings, secrets);
  const res = await fetchImpl(`${base}/models`, { headers });
  if (!res.ok) {
    throw new Error(`OpenAI-compatible listModels failed (${res.status})`);
  }
  const body = (await res.json()) as { data?: { id: string }[] };
  const data = body.data ?? [];
  return data.map(entry => {
    const id = entry.id;
    return {
      id: composeModelId("openai-compatible", id),
      name: id,
      provider: "openai-compatible" as const,
      capabilities: inferCapabilities("openai-compatible", id),
    };
  });
}

export async function* streamOpenAiCompatibleChat(
  settings: OpenAiCompatibleGatewaySettings,
  secrets: SecretsReader,
  fetchImpl: FetchLike,
  model: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
): AsyncGenerator<ChatStreamChunk> {
  const base = trimBaseUrl(settings.baseUrl);
  const headers = {
    ...(await buildAuthHeaders(settings, secrets)),
    "Content-Type": "application/json",
  };

  const res = await fetchImpl(`${base}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, messages, stream: true }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    yield {
      type: "error",
      message: `Chat completion failed (${res.status})${text ? `: ${text.slice(0, 200)}` : ""}`,
    };
    return;
  }

  if (!res.body) {
    yield { type: "error", message: "Chat completion returned no body" };
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
      const parts = buffer.split("\n");
      buffer = parts.pop() ?? "";

      for (const line of parts) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) {
          continue;
        }
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") {
          yield { type: "done", reason: "stop" };
          return;
        }
        let parsed: {
          choices?: { delta?: { content?: string } }[];
          error?: { message?: string };
        };
        try {
          parsed = JSON.parse(payload) as typeof parsed;
        } catch {
          continue;
        }
        if (parsed.error?.message) {
          yield { type: "error", message: parsed.error.message };
          return;
        }
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          yield { type: "text_delta", text: delta };
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

async function buildAuthHeaders(
  settings: OpenAiCompatibleGatewaySettings,
  secrets: SecretsReader,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  const apiKey = await secrets.get(settings.apiKeySecretKey);
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  return headers;
}
