"use client";
import { useRef, useState, type FormEvent } from "react";
import { leadSchema, normalizedPhone, type Lead } from "@siproperty/contracts";
export default function LeadForm({
  projectId,
  variant,
}: {
  projectId: Lead["projectId"];
  variant: "a" | "b";
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    setError("");
    setMessage("");
    const data = new FormData(form);
    const result = leadSchema.safeParse({
      fullName: data.get("fullName"),
      phone: normalizedPhone(String(data.get("phone") ?? "")),
      consent: data.get("consent") === "on",
      projectId,
      variant,
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    const fingerprint = JSON.stringify(result.data);
    if (attempt.current?.fingerprint !== fingerprint)
      attempt.current = { fingerprint, key: crypto.randomUUID() };
    setBusy(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": attempt.current!.key,
        },
        body: fingerprint,
      });
      if (!response.ok) throw new Error("upstream");
      setMessage("Demo request queued. No sales contact will be made.");
      form.reset();
      attempt.current = null;
    } catch {
      setError("We could not queue your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="lead-form" aria-label="Project enquiry">
      <p className="eyebrow">TRY THE CAMPAIGN FLOW</p>
      <h2>
        {variant === "b"
          ? "Explore your next chapter"
          : "Request project details"}
      </h2>
      <p className="form-note">
        Demo only. Use a fictional name and the sample number +12025550123.
      </p>
      <label htmlFor="fullName">Full name</label>
      <input
        id="fullName"
        name="fullName"
        autoComplete="off"
        required
        minLength={2}
        maxLength={100}
        placeholder="Demo Buyer"
      />
      <label htmlFor="phone">Phone number</label>
      <input
        id="phone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="off"
        required
        maxLength={24}
        placeholder="+12025550123"
      />
      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>
          I agree to this demo processing my synthetic form data.{" "}
          <a href="/privacy">Privacy details</a>
        </span>
      </label>
      <button disabled={busy} type="submit">
        {busy
          ? "Queuing…"
          : variant === "b"
            ? "Start exploring ↗"
            : "Request details ↗"}
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="success" role="status">
          {message}
        </p>
      )}
    </form>
  );
}
