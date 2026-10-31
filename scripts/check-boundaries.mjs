#!/usr/bin/env node
/**
 * Ensures only apps/vscode-extension may reference the vscode module.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = path.join(root, "packages");
const appsDir = path.join(root, "apps");

const vscodeImport =
  /(?:from\s+['"]vscode['"]|require\s*\(\s*['"]vscode['"]\s*\))/;

async function walkTsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkTsFiles(full)));
    } else if (/\.tsx?$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function checkDir(label, dir, allowVscode) {
  let files;
  try {
    files = await walkTsFiles(dir);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
  const violations = [];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    if (vscodeImport.test(text) && !allowVscode) {
      violations.push(path.relative(root, file));
    }
  }
  if (violations.length) {
    console.error(`${label}: forbidden vscode import in:\n  ${violations.join("\n  ")}`);
  }
  return violations;
}

const pkgViolations = await checkDir("packages/", packagesDir, false);
const appViolations = [];
for (const name of ["webview"]) {
  const v = await checkDir(`apps/${name}`, path.join(appsDir, name), false);
  appViolations.push(...v);
}

const all = [...pkgViolations, ...appViolations];
if (all.length) {
  process.exit(1);
}
console.log("check:boundaries OK (vscode only allowed in apps/vscode-extension)");
