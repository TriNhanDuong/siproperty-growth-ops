# Security and data handling

This repository is a local engineering pilot, using fictional projects and synthetic contacts only. It is not approved for production customer data.

Do not post credentials or customer data in GitHub Issues. Report a vulnerability through GitHub private vulnerability reporting if enabled, or send the repository owner a private report through an existing trusted channel. If a credential is exposed, revoke it before removing it from files or history.

The router authenticates landing requests, checks Meta HMAC against raw bytes, validates schemas and caps payload sizes. The form proxy checks Origin and keeps the router token server-side. These controls do not substitute for production abuse prevention, durable storage, retention enforcement or source-specific integration review.

`.env` and its variants are ignored; `.env.example` contains explicit demonstration strings and blank connector credentials. Never put a secret in a `NEXT_PUBLIC_` variable. `npm run dev` deliberately launches only a local demo with fixed synthetic settings; it does not load production secrets.

Run `npm run security:scan`, `npm audit --audit-level=high`, and an independent Gitleaks scan before publication. The source scanner reports files and rule names without echoing matched values. Pattern scans cannot establish that arbitrary PII is absent; review all changed data and binary files. There are no original private project files in this newly scaffolded baseline.
