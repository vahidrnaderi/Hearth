import * as vscode from "vscode";
import { getCoreInfo } from "@hearth/core";

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("hearth.showInfo", () => {
    const info = getCoreInfo();
    void vscode.window.showInformationMessage(
      `Hearth core v${info.version} · default role: ${info.defaultRole}`,
    );
  });
  context.subscriptions.push(disposable);
}

export function deactivate(): void {}
