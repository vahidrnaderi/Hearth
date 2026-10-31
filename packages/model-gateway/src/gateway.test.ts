import { describe, expect, it } from "vitest";
import { composeModelId, ModelGateway, parseModelId } from "./index.js";

describe("model-id", () => {
  it("round-trips composite ids", () => {
    const id = composeModelId("ollama", "llama3.2");
    expect(parseModelId(id)).toEqual({
      provider: "ollama",
      providerModelId: "llama3.2",
    });
  });
});

describe("ModelGateway", () => {
  it("lists Ollama models", async () => {
    const fetchImpl = async (input: string | URL) => {
      expect(String(input)).toContain("/api/tags");
      return new Response(
        JSON.stringify({ models: [{ name: "llama3.2:latest" }] }),
        { status: 200 },
      );
    };

    const gateway = new ModelGateway({
      config: {
        ollama: { enabled: true, baseUrl: "http://127.0.0.1:11434" },
        openaiCompatible: {
          enabled: false,
          baseUrl: "http://127.0.0.1:1234/v1",
          apiKeySecretKey: "test-key",
        },
      },
      secrets: { get: async () => undefined },
      fetch: fetchImpl,
    });

    const models = await gateway.listModels();
    expect(models).toHaveLength(1);
    expect(models[0]?.id).toBe("ollama:llama3.2:latest");
    expect(models[0]?.capabilities.streaming).toBe(true);
  });

  it("streams Ollama chat deltas", async () => {
    const body = [
      '{"message":{"content":"Hello"},"done":false}\n',
      '{"message":{"content":" world"},"done":false}\n',
      '{"done":true}\n',
    ].join("");

    const fetchImpl = async () =>
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(body));
            controller.close();
          },
        }),
        { status: 200 },
      );

    const gateway = new ModelGateway({
      config: {
        ollama: { enabled: true, baseUrl: "http://127.0.0.1:11434" },
        openaiCompatible: {
          enabled: false,
          baseUrl: "http://127.0.0.1:1234/v1",
          apiKeySecretKey: "test-key",
        },
      },
      secrets: { get: async () => undefined },
      fetch: fetchImpl,
    });

    const chunks: string[] = [];
    for await (const chunk of gateway.streamChat({
      modelId: "ollama:llama3.2",
      messages: [{ role: "user", content: "Hi" }],
    })) {
      if (chunk.type === "text_delta") {
        chunks.push(chunk.text);
      }
    }
    expect(chunks.join("")).toBe("Hello world");
  });
});
