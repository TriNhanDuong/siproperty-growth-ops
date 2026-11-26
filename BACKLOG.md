# Seven-day implementation backlog

This is a newly scaffolded pilot. The original archive, 18 task descriptions, 24-test suite and two historical form tests were not supplied. These **20 newly authored task specifications** define the next sprint. They are not claimed to be parsed from unavailable original files.

QA-01 and QA-02 carry `bug` plus `day-1-sprint` for two confirmed failure groups in the new baseline. The original historical reports remain unavailable and unverified.

| ID    | Workstream         | Task                                                                                                   | Live issue                                                             |
| ----- | ------------------ | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| LP-01 | bot-1-landing-page | [Validate project configuration and generate project-specific SEO metadata](docs/backlog/LP-01.md)     | [#1](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/1)   |
| LP-02 | bot-1-landing-page | [Add a consent-aware first-party experiment event adapter](docs/backlog/LP-02.md)                      | [#2](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/2)   |
| LP-03 | bot-1-landing-page | [Establish measurable performance and accessibility budgets for campaign pages](docs/backlog/LP-03.md) | [#3](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/3)   |
| LP-04 | bot-1-landing-page | [Package a deployable landing/router stack with rollback and health checks](docs/backlog/LP-04.md)     | [#4](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/4)   |
| LR-01 | bot-2-lead-webhook | [Retrieve Meta lead details through a permission-gated adapter](docs/backlog/LR-01.md)                 | [#5](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/5)   |
| LR-02 | bot-2-lead-webhook | [Replace the volatile queue with a transactional durable inbox/outbox](docs/backlog/LR-02.md)          | [#6](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/6)   |
| LR-03 | bot-2-lead-webhook | [Implement Zalo OA webhook authentication and normalized event mapping](docs/backlog/LR-03.md)         | [#8](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/8)   |
| LR-04 | bot-2-lead-webhook | [Deliver leads to Google Sheets with retry-safe row identity](docs/backlog/LR-04.md)                   | [#10](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/10) |
| LR-05 | bot-2-lead-webhook | [Add a CRM delivery adapter and redacted failure alerts](docs/backlog/LR-05.md)                        | [#11](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/11) |
| LR-06 | bot-2-lead-webhook | [Gate production ingress with abuse controls and data retention](docs/backlog/LR-06.md)                | [#13](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/13) |
| MS-01 | bot-3-scraper      | [Build a permission-gated, bounded live-source fetch policy](docs/backlog/MS-01.md)                    | [#14](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/14) |
| MS-02 | bot-3-scraper      | [Detect scraper DOM drift with versioned extraction fixtures](docs/backlog/MS-02.md)                   | [#15](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/15) |
| MS-03 | bot-3-scraper      | [Persist observations and export comparable pricing summaries](docs/backlog/MS-03.md)                  | [#17](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/17) |
| MS-04 | bot-3-scraper      | [Schedule bounded scraper runs with health and failure artifacts](docs/backlog/MS-04.md)               | [#18](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/18) |
| QA-01 | bot-4-qa           | [Fix reproduced 403 rejection of same-origin form A/B submissions](docs/backlog/QA-01.md)              | [#19](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/19) |
| QA-02 | bot-4-qa           | [Fix reproduced strict-locator collision with the Next route announcer](docs/backlog/QA-02.md)         | [#20](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/20) |
| QA-03 | bot-4-qa           | [Add automated accessibility checks and keyboard assertions](docs/backlog/QA-03.md)                    | [#21](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/21) |
| QA-04 | bot-4-qa           | [Add an opt-in deployed form smoke check with synthetic data](docs/backlog/QA-04.md)                   | [#23](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/23) |
| QA-05 | bot-4-qa           | [Create a least-privilege QA issue/PR reporter with dry-run mode](docs/backlog/QA-05.md)               | [#24](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/24) |
| QA-06 | bot-4-qa           | [Record daily sprint evidence and enforce the release checklist](docs/backlog/QA-06.md)                | [#25](https://github.com/TriNhanDuong/siproperty-growth-ops/issues/25) |

New-file verification commands in each task become executable after implementing that task. Existing baseline verification commands are in README.md.
