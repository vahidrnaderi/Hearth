import { z } from "zod";

/** Model roles; index and project rules are injected regardless of role assignment. */
export const modelRoleSchema = z.enum([
  "agent",
  "plan",
  "edit",
  "autocomplete",
  "embedding",
]);
export type ModelRole = z.infer<typeof modelRoleSchema>;

export const packageVersion = "0.0.0" as const;

export { z };
