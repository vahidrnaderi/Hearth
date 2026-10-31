/** Provider abstraction (M1-3). */
export type ModelCapabilities = {
  streaming: boolean;
  toolCalling: boolean;
  vision: boolean;
  structuredOutput: boolean;
  maxContextTokens?: number;
};

export interface ModelProvider {
  readonly id: string;
  readonly displayName: string;
  listModels(): Promise<{ id: string; name: string }[]>;
}

export const GATEWAY_PACKAGE = "@hearth/model-gateway" as const;
