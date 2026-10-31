import { z } from "@hearth/shared";

/** Webview ↔ extension messages (M1-2). */
export const webviewSendMessageSchema = z.object({
  type: z.literal("send_message"),
  content: z.string(),
});

export type WebviewSendMessage = z.infer<typeof webviewSendMessageSchema>;

export const WEBVIEW_PLACEHOLDER = "M1-2" as const;
