import type * as vscode from "vscode";
import type { ModelGateway } from "@hearth/model-gateway";
import type { ModelInfo } from "@hearth/shared";
import {
  listedModelToInfo,
  pickDefaultModelId,
  syncGatewayConfig,
} from "./gatewayHost.js";

export class ChatController {
  private readonly abortBySession = new Map<string, AbortController>();

  constructor(private readonly gateway: ModelGateway) {}

  async postModelsUpdated(
    webview: vscode.Webview,
    selectedModelId: string | undefined,
  ): Promise<string | undefined> {
    syncGatewayConfig(this.gateway);
    try {
      const listed = await this.gateway.listModels();
      const models: ModelInfo[] = listed.map(listedModelToInfo);
      const selected =
        selectedModelId && models.some(m => m.id === selectedModelId)
          ? selectedModelId
          : pickDefaultModelId(models);
      webview.postMessage({
        type: "models_updated",
        models,
        selectedModelId: selected,
      });
      return selected;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      webview.postMessage({
        type: "error",
        message: `Could not list models: ${message}`,
      });
      webview.postMessage({
        type: "models_updated",
        models: [],
        selectedModelId: undefined,
      });
      return undefined;
    }
  }

  startChat(
    webview: vscode.Webview,
    userText: string,
    modelId: string,
  ): string {
    const sessionId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const abort = new AbortController();
    this.abortBySession.set(sessionId, abort);

    void this.runChat(webview, sessionId, userText, modelId, abort);

    return sessionId;
  }

  cancelChat(webview: vscode.Webview, sessionId: string | undefined): void {
    if (!sessionId) {
      return;
    }
    const abort = this.abortBySession.get(sessionId);
    abort?.abort();
    this.abortBySession.delete(sessionId);
    webview.postMessage({
      type: "agent_event",
      sessionId,
      event: { type: "finished", reason: "cancel" },
    });
  }

  private async runChat(
    webview: vscode.Webview,
    sessionId: string,
    userText: string,
    modelId: string,
    abort: AbortController,
  ): Promise<void> {
    syncGatewayConfig(this.gateway);

    webview.postMessage({
      type: "agent_event",
      sessionId,
      event: { type: "status", message: "Thinking…" },
    });

    try {
      for await (const chunk of this.gateway.streamChat({
        modelId,
        messages: [{ role: "user", content: userText }],
        signal: abort.signal,
      })) {
        if (chunk.type === "text_delta") {
          webview.postMessage({
            type: "agent_event",
            sessionId,
            event: { type: "text_delta", text: chunk.text },
          });
        } else if (chunk.type === "error") {
          webview.postMessage({
            type: "agent_event",
            sessionId,
            event: { type: "error", message: chunk.message },
          });
          webview.postMessage({
            type: "agent_event",
            sessionId,
            event: { type: "finished", reason: "error" },
          });
          return;
        } else if (chunk.type === "done") {
          webview.postMessage({
            type: "agent_event",
            sessionId,
            event: {
              type: "finished",
              reason: chunk.reason === "cancel" ? "cancel" : "stop",
            },
          });
          return;
        }
      }
    } catch (err) {
      if (abort.signal.aborted) {
        return;
      }
      const message = err instanceof Error ? err.message : String(err);
      webview.postMessage({
        type: "agent_event",
        sessionId,
        event: { type: "error", message },
      });
      webview.postMessage({
        type: "agent_event",
        sessionId,
        event: { type: "finished", reason: "error" },
      });
    } finally {
      this.abortBySession.delete(sessionId);
    }
  }
}
