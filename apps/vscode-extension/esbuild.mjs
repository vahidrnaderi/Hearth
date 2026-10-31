import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.js",
  external: ["vscode"],
  platform: "node",
  format: "cjs",
  sourcemap: true,
  target: "node20",
});

console.log("built apps/vscode-extension/dist/extension.js");
