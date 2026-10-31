/** Repository context: explicit vs retrieved (M1-5, M1-6). */
export type ContextSliceKind = "explicit" | "retrieved";

export interface ContextSlice {
  kind: ContextSliceKind;
  label: string;
  content: string;
}

export interface ContextBundle {
  slices: ContextSlice[];
}
