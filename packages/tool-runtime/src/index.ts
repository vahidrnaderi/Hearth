/** Host-implemented workspace access for tools (M1-6). */
export interface WorkspaceFileSystem {
  readText(relativePath: string): Promise<string>;
  list(relativeDir: string): Promise<string[]>;
}

export interface ToolResult {
  ok: boolean;
  content: string;
}

export const READ_ONLY_TOOL_NAMES = [
  "read_file",
  "list_files",
  "search_text",
] as const;
