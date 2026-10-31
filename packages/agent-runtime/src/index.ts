/** Agent loop and sessions (M1-7). */
export type AgentMode = "ask" | "plan" | "agent";

export const DEFAULT_MAX_ITERATIONS = 32;

export interface AgentSession {
  id: string;
  mode: AgentMode;
}
