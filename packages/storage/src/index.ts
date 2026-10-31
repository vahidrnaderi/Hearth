/** Session persistence; SQLite in M4+. */
export interface SessionRecord {
  id: string;
  createdAt: string;
}

export function createInMemorySession(id: string): SessionRecord {
  return { id, createdAt: new Date().toISOString() };
}
