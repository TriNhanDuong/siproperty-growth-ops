import { readdirSync, readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
const root = process.cwd();
const excluded = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "coverage",
  "playwright-report",
  "test-results",
  "data",
]);
const findings = [];
let checked = 0;
const rules = [
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  [
    "github-token",
    /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/,
  ],
  ["cloud-access-key", /\bAKIA[A-Z0-9]{16}\b/],
  ["meta-access-token", /\bEAA[A-Za-z0-9]{60,}\b/],
];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name) || entry.name === "OUTREACH_READY.md")
      continue;
    const path = resolve(dir, entry.name);
    const name = relative(root, path).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      walk(path);
      continue;
    }
    if (!entry.isFile()) continue;
    if (/^\.env(?:\..*)?$/.test(entry.name) && entry.name !== ".env.example")
      findings.push({ file: name, rule: "environment-file" });
    if (/\.(log|tsbuildinfo)$/.test(entry.name)) continue;
    const bytes = readFileSync(path);
    checked++;
    if (bytes.includes(0)) {
      findings.push({ file: name, rule: "unexpected-binary-review-required" });
      continue;
    }
    const value = bytes.toString("utf8");
    for (const [rule, pattern] of rules)
      if (pattern.test(value)) findings.push({ file: name, rule });
  }
}
walk(root);
console.log(
  JSON.stringify(
    {
      checkedSourceFiles: checked,
      findings,
      scope:
        "All source files except ignored dependencies, generated files and local outreach. Pattern scan is not a proof that arbitrary PII or secrets cannot exist.",
    },
    null,
    2,
  ),
);
if (findings.length) process.exitCode = 1;
