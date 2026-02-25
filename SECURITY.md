# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| main branch | ✅ |
| Older releases | ❌ |

We only patch the latest `main` branch. Pin to a specific commit SHA for stability in self-hosted deployments.

## Automated Security

This repository uses:
- GitHub CodeQL analysis on every push
- Dependency vulnerability scanning via `npm audit`
- Automated secret detection via GitHub secret scanning

Found a secret accidentally committed? See our [security response process](#reporting-a-vulnerability).

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email: **security@wokspec.org**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your contact information (for follow-up)

## Response SLA

| Action | Timeframe |
|--------|-----------|
| Acknowledgement | Within 48 hours |
| Initial assessment | Within 7 days |
| Resolution or timeline | Within 30 days |

## Scope

In scope:
- Authentication and authorization bypass
- Server-side injection (SQL, command, prompt)
- Sensitive data exposure (user data, API keys)
- Generation abuse (bypassing content policies)
- CSRF / XSS in the web application

Out of scope:
- Rate limiting bypass in self-hosted OSS deployments (by design)
- Social engineering attacks
- Denial of service from normal API usage
- Issues in third-party provider APIs (report those to the provider directly)

## Disclosure Policy

WokSpec follows coordinated disclosure. After a fix is deployed, we will:
1. Credit the reporter (if they consent)
2. Publish a summary in our changelog
3. Notify affected users if data was at risk

We do not currently offer a bug bounty program.
