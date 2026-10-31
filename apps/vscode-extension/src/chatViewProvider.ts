import * as vscode from "vscode";
import { parseWebviewMessage } from "@hearth/shared";
import {
  cancelStubSession,
  getWebviewDistUri,
  getWebviewHtml,
  postModelsUpdated,
  stubAgentReply,
} from "./chatSession.js";

export class HearthChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "hearth.chat";

  private selectedModelId = "stub-local";
  private activeSessionId: string | undefined;

  constructor(private readonly extensionUri: vscode.Uri) {}

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
    postModelsUpdated(webview, this.selectedModelId);

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
          postModelsUpdated(webview, this.selectedModelId);
          break;
        case "send_message":
          this.activeSessionId = stubAgentReply(webview, msg.content);
          break;
        case "cancel":
          cancelStubSession(webview, msg.sessionId ?? this.activeSessionId);
          this.activeSessionId = undefined;
          break;
      }
    });
  }
}
