import { spawn } from "node:child_process";
// One local demo launcher: both services inherit these synthetic settings.
const env = {
  ...process.env,
  LEAD_ROUTER_URL: "http://127.0.0.1:4100",
  LEAD_ROUTER_TOKEN: "local-demo-router-token-replace-before-deploy",
  META_VERIFY_TOKEN: "local-demo-meta-verification-token",
  META_APP_SECRET: "local-demo-meta-signing-secret-replace-before-deploy",
  PORT: "4100",
  HOST: "127.0.0.1",
  NEXT_TELEMETRY_DISABLED: "1",
};
const npm = process.env.npm_execpath;
if (!npm) throw new Error("Run through npm run dev");
const production = process.argv.includes("--production");
const children = ["@siproperty/lead-router", "@siproperty/landing-pages"].map(
  (workspace) =>
    spawn(
      process.execPath,
      [npm, "run", production ? "start" : "dev", "--workspace", workspace],
      { stdio: "inherit", env },
    ),
);
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  setTimeout(() => process.exit(code), 300).unref();
}
for (const child of children) child.on("exit", (code) => stop(code ?? 1));
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
