# Working agreement

Use Node.js 24.12 or later (24 LTS recommended), npm, and PowerShell, bash or a comparable shell. `npm ci --ignore-scripts` installs from the lockfile. Run `npm run verify` and, after installing Chromium with `npx playwright install chromium`, run `npm run test:scraper` and `npm run test:e2e`.

One issue per branch: `<bot-label>/<issue-number>-short-name`. Record the issue acceptance criteria and exact test output in the PR. Workstreams may execute concurrently, but share contracts only through reviewed changes to `packages/contracts/src/index.ts`. Rebase before merge and rerun affected tests. Do not allow bots to merge their own PRs or receive unrestricted account tokens.

Do not weaken assertions, skip failing tests, change fixtures to conceal failures or describe unrun tests as passing. Historical form reports are unverified because the original source and tests were not supplied. The new baseline independently reproduces a 403 submission defect and an ambiguous alert locator, tracked in QA-01 and QA-02. Its browser CI is expected to fail until those issues are fixed.

All demonstration contacts use the reserved fictional North American number +12025550123. Project names and market prices are invented. Live scraping requires the source allowlist, permission review and bounded request policy in MS-01. Meta/Zalo/CRM/Sheets credentials are supplied only through deployment secrets after their issues are complete.

Repository ownership can be verified by a reviewer using the GitHub account and a signed challenge commit. Do not share authentication tokens, screenshots of account secrets or unrelated private company documents as ownership proof.
