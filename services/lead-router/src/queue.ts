import { createHash } from "node:crypto";
export type Event = { key: string; source: "landing" | "meta"; data: unknown };
export type Job = {
  event: Event;
  fingerprint: string;
  state: "queued" | "delivered" | "dead";
  attempts: number;
  nextAt: number;
  createdAt: number;
};
export class CapacityError extends Error {}
export class ConflictError extends Error {}
/** Demonstration queue only: state is lost on restart; durable outbox is backlog L02. */
export class MemoryQueue {
  readonly jobs = new Map<string, Job>();
  private running = false;
  constructor(
    private readonly capacity = 1000,
    private readonly ttlMs = 3600000,
    private readonly now = () => Date.now(),
  ) {}
  enqueue(event: Event): { duplicate: boolean } {
    const now = this.now();
    for (const [key, job] of this.jobs)
      if (job.state !== "queued" && now - job.createdAt > this.ttlMs)
        this.jobs.delete(key);
    const fingerprint = createHash("sha256")
      .update(JSON.stringify(event.data))
      .digest("hex");
    const old = this.jobs.get(event.key);
    if (old) {
      if (old.fingerprint !== fingerprint)
        throw new ConflictError(
          "Idempotency key reused for a different payload",
        );
      return { duplicate: true };
    }
    if (this.jobs.size >= this.capacity)
      throw new CapacityError("Queue capacity reached");
    this.jobs.set(event.key, {
      event,
      fingerprint,
      state: "queued",
      attempts: 0,
      nextAt: now,
      createdAt: now,
    });
    return { duplicate: false };
  }
  async drain(
    deliver: (event: Event) => Promise<void>,
    maxAttempts = 3,
  ): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      for (const job of this.jobs.values()) {
        if (job.state !== "queued" || job.nextAt > this.now()) continue;
        job.attempts++;
        try {
          await deliver(job.event);
          job.state = "delivered";
        } catch {
          job.state = job.attempts >= maxAttempts ? "dead" : "queued";
          job.nextAt =
            this.now() + Math.min(60000, 1000 * 2 ** (job.attempts - 1));
        }
      }
    } finally {
      this.running = false;
    }
  }
  counts() {
    return {
      queued: [...this.jobs.values()].filter((j) => j.state === "queued")
        .length,
      delivered: [...this.jobs.values()].filter((j) => j.state === "delivered")
        .length,
      dead: [...this.jobs.values()].filter((j) => j.state === "dead").length,
    };
  }
}
