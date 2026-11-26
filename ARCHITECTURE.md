# Architecture

## Boundaries and folders

| Path                    | Responsibility                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------ |
| apps/landing-pages      | Next.js App Router, synthetic project catalogue, A/B forms, same-origin server proxy |
| packages/contracts      | Shared Zod validation and minimal lead/Meta payload contracts                        |
| services/lead-router    | Node HTTP ingress, bearer/HMAC validation, bounded volatile queue, discard-only sink |
| services/market-scraper | TypeScript Playwright local-fixture extractor and narrow Vietnamese price parser     |
| fixtures/market         | Synthetic HTML only; no snapshots from proprietary sites                             |
| tests/unit              | Contract, queue, HMAC and price parser tests                                         |
| tests/integration       | Real ephemeral-port HTTP router tests and proxy boundary tests                       |
| tests/e2e               | Production Next.js + router processes, Chromium desktop/mobile form/page checks      |
| docs/backlog            | Twenty agent-executable sprint specifications                                        |
| .github/workflows       | Read-only, SHA-pinned CI on Ubuntu/Windows and browser smoke                         |

TypeScript is used for the scraper as well as the router to share one Windows toolchain. A Python runtime is not required. The initial brief's optional Python scraper is not claimed as implemented.

## Schemas

Landing input: `{ fullName: string(2..100), phone: international/local number, consent: true, projectId: known enum, variant: a|b }`. Unknown properties are rejected. Client normalizes display separators; the server validates again. All fixtures use fictional names and +12025550123. No email, address, ad-account token or CRM credential is accepted from the browser.

Meta input: `{ object: page, entry: [{ id: pageId, changes: [{ field: leadgen, value: { leadgen_id, page_id } }] }] }`. Signature is SHA-256 HMAC over original bytes. An accepted event contains only pageId and leadId. The server does not retrieve contacts from Graph API; that is LR-01. No Meta app webhook subscription is configured.

Queue job: `{ event: {key, source, data}, fingerprint, state, attempts, nextAt, createdAt }`. Landing key is namespaced `landing:<idempotency-key>`; Meta key is `meta:<pageId>:<leadId>`. Reuse of a landing key with a changed canonical payload returns 409.

Price observation: `{ listingId, projectId, sourceUrl, observedAt, price: {amount, currency: VND, unit: total|per_m2}, synthetic: true }`. Values such as `3,2 tỷ` and `42 triệu/m²` remain separate units. Ambiguous or unavailable prices are discarded, never coerced into zero. The current extractor opens no external URL.

## Implemented request flow

1. Browser form posts JSON to /api/leads with a stable per-attempt UUID. A failed attempt retains its key; a changed validated payload gets a new key.
2. Next.js verifies same-origin requests, content type, 16 KiB size, schema and idempotency key. The server-only router token is never returned to the browser. An upstream request has a five-second timeout and rejects redirects.
3. Router /v1/leads checks bearer token, 64 KiB size and schema, then enqueues. /webhooks/meta uses GET verification or signed POST delivery instead. Unconfigured Meta ingress fails closed. Unknown methods/routes return 404.
4. A 202 means **accepted into the in-memory demo queue only**, not delivery to a durable system or CRM. Bounded capacity returns 503; key conflict returns 409. Health returns counts and mode, not contact payloads.
5. Demo worker drains every second into a sink that discards data. Failed delivery retries after 1s and 2s, then dead-letters after the third failed attempt. The default successful sink never calls an external service. Terminal entries expire after one hour on subsequent enqueue; pending entries are retained. There is no cross-process coordination.

The volatile queue exists to make local behavior testable. Do not put this behind a live ad webhook: a restart loses accepted work, process replicas cannot deduplicate, and a demo delivery is not a business delivery.

## Durable target design (LR-02)

Transactionally persist an inbox event under a unique source/event key and create its outbox row before acknowledging 202. Worker leases must survive crashes and be reclaimable. Use an atomic claim and idempotent downstream identity; remote timeout-after-write needs reconciliation. Add bounded exponential backoff with jitter, permanent-vs-retryable error categories, dead-letter replay, bounded retention and no raw contact logs. Tests must restart the database/worker and race duplicate deliveries. SQL migrations, database selection and adapter code are not present in the baseline.

## Integration status

Meta challenge/HMAC/ID receiving is locally implemented; Graph permissions, live app subscription and retrieval are pending. Zalo OA, Sheets, CRM, persistent observation storage, live scraping, valuation summaries, scheduled collection, live QA and automated fix PRs are planned. Solid/dotted architecture edges in README distinguish them. Never invent a Zalo signature algorithm from the Meta implementation.

## Commands

```powershell
npm ci --ignore-scripts
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:scraper
npm run test:e2e
npm run security:scan
npm audit --audit-level=high
```

Browser tests start built applications on loopback ports 3000 and 4100. Stop other users of those ports first; tests do not reuse an arbitrary running server. Unit HTTP tests bind ephemeral ports. Synthetic demo variables are injected by scripts/dev.mjs; keep production credentials out of test runners. CI runs Ubuntu/Windows unit/build checks and an Ubuntu Chromium job with failure-only artifacts.

## Operational constraints

No production deployment has been performed. CI has read-only contents permission, protected secrets are not used, and actions are pinned to commit SHAs. Production readiness depends on LR-02/LR-06 and the deployment/live-QA issues, not on the number of green local tests. Source scans and dependency audits are evidence with known limits, not a claim that all security risks are eliminated.
