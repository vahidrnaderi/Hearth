import { z } from "zod";

/** Webview → extension host */
export const sendMessageSchema = z.object({
  type: z.literal("send_message"),
  content: z.string().min(1).max(100_000),
});

export const cancelAgentSchema = z.object({
  type: z.literal("cancel"),
  sessionId: z.string().min(1).optional(),
});

export const selectModelSchema = z.object({
  type: z.literal("select_model"),
  modelId: z.string().min(1),
});

export const webviewToExtensionMessageSchema = z.discriminatedUnion("type", [
  sendMessageSchema,
  cancelAgentSchema,
  selectModelSchema,
]);

export type WebviewToExtensionMessage = z.infer<
  typeof webviewToExtensionMessageSchema
>;

export const modelInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string().optional(),
});

export type ModelInfo = z.infer<typeof modelInfoSchema>;

export const agentEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("status"),
    message: z.string(),
  }),
  z.object({
    type: z.literal("text_delta"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("finished"),
    reason: z.enum(["stop", "cancel", "error"]).optional(),
  }),
  z.object({
    type: z.literal("error"),
    message: z.string(),
  }),
]);

export type AgentEvent = z.infer<typeof agentEventSchema>;

export const agentEventMessageSchema = z.object({
  type: z.literal("agent_event"),
  sessionId: z.string(),
  event: agentEventSchema,
});

export const modelsUpdatedMessageSchema = z.object({
  type: z.literal("models_updated"),
  models: z.array(modelInfoSchema),
  selectedModelId: z.string().optional(),
});

export const extensionErrorMessageSchema = z.object({
  type: z.literal("error"),
  message: z.string(),
});

export const extensionToWebviewMessageSchema = z.discriminatedUnion("type", [
  agentEventMessageSchema,
  modelsUpdatedMessageSchema,
  extensionErrorMessageSchema,
]);

export type ExtensionToWebviewMessage = z.infer<
  typeof extensionToWebviewMessageSchema
>;

export function parseWebviewMessage(
  input: unknown,
): z.SafeParseReturnType<unknown, WebviewToExtensionMessage> {
  return webviewToExtensionMessageSchema.safeParse(input);
}

export function parseExtensionMessage(
  input: unknown,
): z.SafeParseReturnType<unknown, ExtensionToWebviewMessage> {
  return extensionToWebviewMessageSchema.safeParse(input);
}
