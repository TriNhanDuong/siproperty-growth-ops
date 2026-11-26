import { createApp } from "./app";
const token = process.env.LEAD_ROUTER_TOKEN ?? "";
const { server, queue } = createApp({
  token,
  metaVerifyToken: process.env.META_VERIFY_TOKEN,
  metaAppSecret: process.env.META_APP_SECRET,
});
// Demo sink discards payloads. No external API, CRM write, or customer logging happens.
const timer = setInterval(() => void queue.drain(async () => {}), 1000);
timer.unref();
server.listen(
  Number(process.env.PORT ?? 4100),
  process.env.HOST ?? "127.0.0.1",
  () => console.log("Lead router ready (demo, volatile storage)"),
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    clearInterval(timer);
    server.close(() => process.exit(0));
  });
