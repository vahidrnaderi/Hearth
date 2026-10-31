import * as vscode from "vscode";
import { parseWebviewMessage } from "@hearth/shared";
import type { ChatController } from "./chatController.js";
import { getWebviewDistUri, getWebviewHtml } from "./chatSession.js";

export class HearthChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "hearth.chat";

  private selectedModelId: string | undefined;
  private activeSessionId: string | undefined;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly chat: ChatController,
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    const webview = webviewView.webview;
    webview.options = {
      enableScripts: true,
      localResourceRoots: [getWebviewDistUri(this.extensionUri)],
    };
    webview.html = getWebviewHtml(webview, this.extensionUri);

    void this.chat
      .postModelsUpdated(webview, this.selectedModelId)
      .then(id => {
        if (id) {
          this.selectedModelId = id;
        }
      });

    webview.onDidReceiveMessage(raw => {
      const parsed = parseWebviewMessage(raw);
      if (!parsed.success) {
        webview.postMessage({
          type: "error",
          message: `Invalid webview message: ${parsed.error.message}`,
        });
        return;
      }

      const msg = parsed.data;
      switch (msg.type) {
        case "select_model":
          this.selectedModelId = msg.modelId;
          break;
        case "send_message": {
          if (!this.selectedModelId) {
            webview.postMessage({
              type: "error",
              message: "No model selected. Check Ollama or provider settings.",
            });
            return;
          }
          this.activeSessionId = this.chat.startChat(
            webview,
            msg.content,
            this.selectedModelId,
          );
          break;
        }
        case "cancel":
          this.chat.cancelChat(webview, msg.sessionId ?? this.activeSessionId);
          this.activeSessionId = undefined;
          break;
      }
    });
  }

  refreshModels(webview: vscode.Webview): void {
    void this.chat.postModelsUpdated(webview, this.selectedModelId);
  }
}
