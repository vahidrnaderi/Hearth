import * as vscode from "vscode";
import { getCoreInfo } from "@hearth/core";
import { ChatController } from "./chatController.js";
import { HearthChatViewProvider } from "./chatViewProvider.js";
import {
  createModelGateway,
  syncGatewayConfig,
} from "./gatewayHost.js";
import {
  OPENAI_COMPATIBLE_API_KEY_SECRET,
} from "./hearthConfig.js";

export function activate(context: vscode.ExtensionContext): void {
  const gateway = createModelGateway(context);
  const chat = new ChatController(gateway);
  const provider = new HearthChatViewProvider(context.extensionUri, chat);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      HearthChatViewProvider.viewType,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } },
    ),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration("hearth")) {
        syncGatewayConfig(gateway);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("hearth.showInfo", () => {
      const info = getCoreInfo();
      void vscode.window.showInformationMessage(
        `Hearth core v${info.version} · default role: ${info.defaultRole}`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("hearth.openChat", () => {
      void vscode.commands.executeCommand("workbench.view.extension.hearth");
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("hearth.setOpenAiApiKey", async () => {
      const key = await vscode.window.showInputBox({
        title: "OpenAI-compatible API key",
        prompt: "Stored in VS Code SecretStorage (not settings.json)",
        password: true,
        ignoreFocusOut: true,
      });
      if (key === undefined) {
        return;
      }
      const trimmed = key.trim();
      if (trimmed) {
        await context.secrets.store(OPENAI_COMPATIBLE_API_KEY_SECRET, trimmed);
      } else {
        await context.secrets.delete(OPENAI_COMPATIBLE_API_KEY_SECRET);
      }
      void vscode.window.showInformationMessage(
        trimmed ? "Hearth API key saved." : "Hearth API key cleared.",
      );
    }),
  );
}

export function deactivate(): void {}
