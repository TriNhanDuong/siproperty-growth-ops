import { describe, it, expect } from "vitest";
import {
  CapacityError,
  ConflictError,
  MemoryQueue,
} from "../../services/lead-router/src/queue";
const event = {
  key: "test-event",
  source: "meta" as const,
  data: { leadId: "demo-id" },
};
describe("volatile queue contract", () => {
  it("deduplicates re-delivered events", () => {
    const q = new MemoryQueue();
    expect(q.enqueue(event).duplicate).toBe(false);
    expect(q.enqueue(event).duplicate).toBe(true);
    expect(q.counts().queued).toBe(1);
  });
  it("rejects key reuse with a changed payload", () => {
    const q = new MemoryQueue();
    q.enqueue(event);
    expect(() =>
      q.enqueue({ ...event, data: { leadId: "other-demo" } }),
    ).toThrow(ConflictError);
  });
  it("applies bounded backpressure without removing pending work", () => {
    const q = new MemoryQueue(1);
    q.enqueue(event);
    expect(() => q.enqueue({ ...event, key: "other" })).toThrow(CapacityError);
    expect(q.counts().queued).toBe(1);
  });
  it("retries transient failure with exponential delay and eventually delivers", async () => {
    let now = 0;
    let calls = 0;
    const q = new MemoryQueue(10, 10000, () => now);
    q.enqueue(event);
    const sink = async () => {
      if (++calls < 3) throw Error("temporary");
    };
    await q.drain(sink);
    expect(q.jobs.get(event.key)?.nextAt).toBe(1000);
    await q.drain(sink);
    expect(calls).toBe(1);
    now = 1000;
    await q.drain(sink);
    expect(q.jobs.get(event.key)?.nextAt).toBe(3000);
    now = 3000;
    await q.drain(sink);
    expect(q.counts().delivered).toBe(1);
  });
  it("stops after three failed deliveries", async () => {
    let now = 0;
    const q = new MemoryQueue(10, 10000, () => now);
    q.enqueue(event);
    for (const t of [0, 1000, 3000, 100000]) {
      now = t;
      await q.drain(async () => {
        throw Error("down");
      });
    }
    expect(q.jobs.get(event.key)?.attempts).toBe(3);
    expect(q.counts().dead).toBe(1);
  });
  it("expires completed jobs but retains pending jobs", async () => {
    let now = 0;
    const q = new MemoryQueue(2, 100, () => now);
    q.enqueue(event);
    await q.drain(async () => {});
    q.enqueue({ ...event, key: "pending" });
    now = 101;
    q.enqueue({ ...event, key: "new" });
    expect(q.jobs.has(event.key)).toBe(false);
    expect(q.jobs.has("pending")).toBe(true);
  });
  it("does not deliver a job twice during overlapping drain calls", async () => {
    let resolve!: () => void;
    let calls = 0;
    const q = new MemoryQueue();
    q.enqueue(event);
    const first = q.drain(async () => {
      calls++;
      await new Promise<void>((r) => {
        resolve = r;
      });
    });
    await q.drain(async () => {
      calls++;
    });
    resolve();
    await first;
    expect(calls).toBe(1);
  });
});
