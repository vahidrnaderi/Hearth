import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type AgentEvent,
  type ExtensionToWebviewMessage,
  type ModelInfo,
  parseExtensionMessage,
} from "@hearth/shared";

type VsCodeApi = {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

declare function acquireVsCodeApi(): VsCodeApi;

type ChatLine =
  | { kind: "user"; text: string }
  | { kind: "assistant"; text: string }
  | { kind: "status"; text: string };

function getVsCodeApi(): VsCodeApi | undefined {
  if (typeof acquireVsCodeApi === "function") {
    return acquireVsCodeApi();
  }
  return undefined;
}

export function App() {
  const vscode = useMemo(() => getVsCodeApi(), []);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [draft, setDraft] = useState("");
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();

  const post = useCallback(
    (message: unknown) => {
      vscode?.postMessage(message);
    },
    [vscode],
  );

  const applyAgentEvent = useCallback((event: AgentEvent) => {
    switch (event.type) {
      case "status":
        setLines(prev => [...prev, { kind: "status", text: event.message }]);
        break;
      case "text_delta":
        setLines(prev => {
          const last = prev[prev.length - 1];
          if (last?.kind === "assistant") {
            return [
              ...prev.slice(0, -1),
              { kind: "assistant", text: last.text + event.text },
            ];
          }
          return [...prev, { kind: "assistant", text: event.text }];
        });
        break;
      case "finished":
        setBusy(false);
        if (event.reason === "cancel") {
          setLines(prev => [...prev, { kind: "status", text: "Cancelled." }]);
        }
        break;
      case "error":
        setBusy(false);
        setLines(prev => [...prev, { kind: "status", text: event.message }]);
        break;
    }
  }, []);

  const handleExtensionMessage = useCallback(
    (raw: unknown) => {
      const parsed = parseExtensionMessage(raw);
      if (!parsed.success) {
        return;
      }
      const msg: ExtensionToWebviewMessage = parsed.data;
      switch (msg.type) {
        case "models_updated":
          setModels(msg.models);
          if (msg.selectedModelId) {
            setSelectedModelId(msg.selectedModelId);
          } else if (msg.models[0]) {
            setSelectedModelId(msg.models[0].id);
          }
          break;
        case "agent_event":
          setSessionId(msg.sessionId);
          applyAgentEvent(msg.event);
          break;
        case "error":
          setLines(prev => [...prev, { kind: "status", text: msg.message }]);
          break;
      }
    },
    [applyAgentEvent],
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      handleExtensionMessage(event.data);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [handleExtensionMessage]);

  const onSend = () => {
    const content = draft.trim();
    if (!content || busy) {
      return;
    }
    setLines(prev => [...prev, { kind: "user", text: content }]);
    setDraft("");
    setBusy(true);
    post({ type: "send_message", content });
  };

  const onCancel = () => {
    post({ type: "cancel", sessionId });
  };

  const onModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    post({ type: "select_model", modelId });
  };

  return (
    <div className="hearth">
      <header className="hearth-header">
        <span className="hearth-title">Hearth</span>
        <select
          className="hearth-model"
          value={selectedModelId}
          onChange={e => onModelChange(e.target.value)}
          disabled={models.length === 0}
        >
          {models.length === 0 ? (
            <option value="">No models</option>
          ) : (
            models.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))
          )}
        </select>
      </header>
      <main className="hearth-log">
        {lines.length === 0 ? (
          <p className="hearth-empty">Send a message (requires Ollama or an enabled OpenAI-compatible server).</p>
        ) : (
          lines.map((line, i) => (
            <div key={i} className={`hearth-line hearth-line-${line.kind}`}>
              {line.text}
            </div>
          ))
        )}
      </main>
      <footer className="hearth-compose">
        <textarea
          className="hearth-input"
          rows={3}
          value={draft}
          placeholder="Message…"
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <div className="hearth-actions">
          <button type="button" onClick={onSend} disabled={busy || !draft.trim()}>
            Send
          </button>
          <button type="button" onClick={onCancel} disabled={!busy}>
            Stop
          </button>
        </div>
      </footer>
    </div>
  );
}
