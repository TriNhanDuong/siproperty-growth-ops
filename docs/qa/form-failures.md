# Reproduced new-baseline failures

Environment: Windows, Node 26.13.1, npm 11.20.0, Next.js 16.4.6, Playwright 1.65.1 / Chromium 159.0.8154.6. Run on 26 November 2026 (Asia/Saigon). This is the new scaffold, not the unavailable original project.

## Run

```powershell
npm ci --ignore-scripts
npm run build
npx playwright install chromium
npm run test:e2e
```

The suite runs seven scenarios in each of two profiles, `chromium-desktop` and `chromium-mobile` (Pixel 7 emulation). **6 passed, 8 failed, 0 skipped, retries disabled.** Both profiles reproduce the same four failing scenarios. The catalogue, consent-required and unknown-project cases pass in each profile.

## QA-01: genuine form-submission defect

The variant A and variant B successful-submission cases time out waiting for `role=status`, because the UI instead shows:

```text
We could not queue your request. Please try again.
```

A preserved Playwright network trace recorded:

```text
POST http://127.0.0.1:3000/api/leads
Origin: http://127.0.0.1:3000
Response status: 403
```

Four cases fail: variant A and variant B on desktop and mobile. The proxy's strict origin check is the investigation point. A likely cause is Next.js reconstructing an internal request URL with a different hostname; that explanation is an inference, not a measured internal URL. Fix through explicit trusted origin configuration while retaining rejection of foreign/missing origins. Do not bypass CSRF checks to make the test green.

Focused reproduction:

```powershell
npm run build
npx playwright test tests/e2e/forms.spec.ts --grep "variant A queues|variant B queues"
```

## QA-02: genuine test-locator defect

Both the invalid-phone and upstream-failure tests use a page-wide `getByRole('alert')`. Next.js also renders an alert announcer, so strict mode resolves two elements:

```text
1) <p role="alert" class="error">Use a valid international or local phone number.</p>
2) <div role="alert" aria-live="assertive" id="__next-route-announcer__"></div>
```

Four cases fail in strict mode across desktop/mobile. Validation error text is present. Scope the assertion to the named `Project enquiry` form, retaining the expected text and strict semantics. Do not use `.first()`, skip tests or delete assertions. The upstream-retry scenario will still depend on QA-01 for its final successful-submission step.

Focused reproduction:

```powershell
npm run build
npx playwright test tests/e2e/forms.spec.ts --grep "invalid phone|upstream failure"
```

## Evidence retention

The existing tests and implementation are intentionally retained as the sprint baseline after discovery; no failing case has been marked expected, skipped or removed. Playwright writes local screenshots and traces under ignored `test-results/` and a report under ignored `playwright-report/`. CI uploads failure artifacts for seven days and remains red when these cases fail. There is no `continue-on-error` or expected-failure annotation masking the browser job.

Raw local traces can contain workstation paths. They are excluded from public git history; this document provides normalized reproduction evidence. Only synthetic form data was used. Original historical form reports remain separately unverified in `historical-form-reports.md`.
