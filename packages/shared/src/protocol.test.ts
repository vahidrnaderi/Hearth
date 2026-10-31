import { describe, expect, it } from "vitest";
import {
  extensionToWebviewMessageSchema,
  parseWebviewMessage,
  webviewToExtensionMessageSchema,
} from "./protocol.js";

describe("webviewToExtensionMessageSchema", () => {
  it("accepts send_message, cancel, select_model", () => {
    expect(
      webviewToExtensionMessageSchema.parse({
        type: "send_message",
        content: "hello",
      }),
    ).toEqual({ type: "send_message", content: "hello" });
    expect(
      webviewToExtensionMessageSchema.parse({ type: "cancel", sessionId: "s1" }),
    ).toEqual({ type: "cancel", sessionId: "s1" });
    expect(
      webviewToExtensionMessageSchema.parse({
        type: "select_model",
        modelId: "local-qwen",
      }),
    ).toEqual({ type: "select_model", modelId: "local-qwen" });
  });

  it("rejects unknown types", () => {
    expect(parseWebviewMessage({ type: "nope" }).success).toBe(false);
  });
});

describe("extensionToWebviewMessageSchema", () => {
  it("accepts models_updated and agent_event", () => {
    expect(
      extensionToWebviewMessageSchema.parse({
        type: "models_updated",
        models: [{ id: "a", name: "Model A" }],
        selectedModelId: "a",
      }),
    ).toMatchObject({ type: "models_updated" });
    expect(
      extensionToWebviewMessageSchema.parse({
        type: "agent_event",
        sessionId: "sess-1",
        event: { type: "text_delta", text: "Hi" },
      }),
    ).toMatchObject({ type: "agent_event" });
  });
});
