# Historical form reports: evidence boundary

The user-provided brief described an existing build, 24 passing tests and two unverified/failing form tests. The source archive, original task descriptions, test names, stack traces and reproduction steps were not supplied or found in the available project locations.

This baseline is newly scaffolded. Its unit/integration and browser results are independent measurements. No original test was deleted, weakened, recovered or claimed fixed. The new E2E run separately found two confirmed failure groups tracked as QA-01 and QA-02: same-origin HTTP 403 and ambiguous alert selectors. These must not be identified as the original historical failures.

| Report                   | Status                           | Current action                                                                               |
| ------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------- |
| Historical form report 1 | Unverified; original test absent | Original evidence needed; QA-01 separately tracks a confirmed new-baseline 403               |
| Historical form report 2 | Unverified; original test absent | Original evidence needed; QA-02 separately tracks a confirmed new-baseline locator collision |

If original source or traces become available, preserve them unchanged in a private audit workspace first, sanitize fixtures, and add the actual reproduction command. Do not infer two failing tests merely because a grant pitch requested authentic Day-1 bugs.
