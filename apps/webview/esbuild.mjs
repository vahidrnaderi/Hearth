import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/main.tsx"],
  bundle: true,
  outfile: "dist/webview.js",
  format: "iife",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  loader: { ".css": "text" },
  sourcemap: true,
  minify: process.env.NODE_ENV === "production",
});

console.log("built apps/webview/dist/webview.js");
