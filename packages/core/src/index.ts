import type { ModelRole } from "@hearth/shared";
import { packageVersion } from "@hearth/shared";

/** Application orchestration entry (wired in M1-2+). */
export type HearthCoreInfo = {
  version: string;
  defaultRole: ModelRole;
};

export function getCoreInfo(): HearthCoreInfo {
  return { version: packageVersion, defaultRole: "agent" };
}
