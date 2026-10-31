export type ModelCapabilities = {
  streaming: boolean;
  toolCalling: boolean;
  vision: boolean;
  structuredOutput: boolean;
  maxContextTokens?: number;
};

export type ModelProviderKind = "ollama" | "openai-compatible";

export type ListedModel = {
  /** Composite id: `{provider}:{providerModelId}` */
  id: string;
  name: string;
  provider: ModelProviderKind;
  capabilities: ModelCapabilities;
};

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatStreamChunk =
  | { type: "text_delta"; text: string }
  | { type: "done"; reason: "stop" | "cancel" }
  | { type: "error"; message: string };

export type SecretsReader = {
  get(key: string): Promise<string | undefined>;
};

export type FetchLike = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

export type OllamaGatewaySettings = {
  enabled: boolean;
  baseUrl: string;
};

export type OpenAiCompatibleGatewaySettings = {
  enabled: boolean;
  baseUrl: string;
  /** SecretStorage key name (host stores the API key). */
  apiKeySecretKey: string;
};

export type GatewayConfig = {
  ollama: OllamaGatewaySettings;
  openaiCompatible: OpenAiCompatibleGatewaySettings;
};

export type GatewayOptions = {
  config: GatewayConfig;
  secrets: SecretsReader;
  fetch?: FetchLike;
};
