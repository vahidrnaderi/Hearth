import { describe, expect, it } from "vitest";
import { modelRoleSchema } from "./index.js";

describe("modelRoleSchema", () => {
  it("accepts agent role for M1", () => {
    expect(modelRoleSchema.parse("agent")).toBe("agent");
  });
});
