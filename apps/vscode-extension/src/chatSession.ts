import * as vscode from "vscode";
import { getCoreInfo } from "@hearth/core";

export function getWebviewHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
): string {
  const webviewDist = vscode.Uri.joinPath(extensionUri, "..", "webview", "dist");
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(webviewDist, "webview.js"),
  );
  const cspSource = webview.cspSource;
  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hearth</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

export function getWebviewDistUri(extensionUri: vscode.Uri): vscode.Uri {
  return vscode.Uri.joinPath(extensionUri, "..", "webview", "dist");
}

function getNonce(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

export function postModelsUpdated(
  webview: vscode.Webview,
  selectedModelId: string,
): void {
  webview.postMessage({
    type: "models_updated",
    models: [
      { id: "stub-local", name: "Local (stub)", provider: "ollama" },
      { id: "stub-cloud", name: "Cloud (stub)", provider: "openai-compatible" },
    ],
    selectedModelId,
  });
}

export function stubAgentReply(webview: vscode.Webview, userText: string): string {
  const sessionId = `stub-${Date.now()}`;
  const info = getCoreInfo();
  const reply = `[M1-2 stub] Hearth core v${info.version}. You said: ${userText.slice(0, 500)}`;

  void (async () => {
    webview.postMessage({
      type: "agent_event",
      sessionId,
      event: { type: "status", message: "Thinking…" },
    });
    for (const word of reply.split(" ")) {
      await delay(40);
      webview.postMessage({
        type: "agent_event",
        sessionId,
        event: { type: "text_delta", text: `${word} ` },
      });
    }
    webview.postMessage({
      type: "agent_event",
      sessionId,
      event: { type: "finished", reason: "stop" },
    });
  })();

  return sessionId;
}

export function cancelStubSession(
  webview: vscode.Webview,
  sessionId: string | undefined,
): void {
  if (!sessionId) {
    return;
  }
  webview.postMessage({
    type: "agent_event",
    sessionId,
    event: { type: "finished", reason: "cancel" },
  });
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
