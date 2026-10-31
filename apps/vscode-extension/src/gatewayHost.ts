import * as vscode from "vscode";
import { ModelGateway } from "@hearth/model-gateway";
import type { ListedModel } from "@hearth/model-gateway";
import type { ModelInfo } from "@hearth/shared";
import { createSecretsReader, readGatewayConfig } from "./hearthConfig.js";

export function createModelGateway(
  context: vscode.ExtensionContext,
): ModelGateway {
  return new ModelGateway({
    config: readGatewayConfig(),
    secrets: createSecretsReader(context),
  });
}

export function syncGatewayConfig(gateway: ModelGateway): void {
  gateway.updateConfig(readGatewayConfig());
}

export function listedModelToInfo(model: ListedModel): ModelInfo {
  return {
    id: model.id,
    name: model.name,
    provider: model.provider,
  };
}

export function pickDefaultModelId(models: ModelInfo[]): string | undefined {
  const ollama = models.find(m => m.provider === "ollama");
  return ollama?.id ?? models[0]?.id;
}
