import * as vscode from "vscode";
import { getCoreInfo } from "@hearth/core";
import { HearthChatViewProvider } from "./chatViewProvider.js";

export function activate(context: vscode.ExtensionContext): void {
  const provider = new HearthChatViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      HearthChatViewProvider.viewType,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } },
    ),
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
}

export function deactivate(): void {}
