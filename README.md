# WAF Checker

A web tool to test how well your Web Application Firewall (WAF) blocks common attacks. Built as a Cloudflare Worker with TypeScript. Provides a web UI for running various attack payloads against your target and analyzing results.

## Features

### Core Testing
- Enter a target URL, pick HTTP methods (GET, POST, PUT, DELETE) and attack categories
- Sends requests with attack payloads (in parameters, headers, or as file paths)
- Color-coded results: 🟢 403 = blocked, 🔴 2xx/5xx = potential vulnerability, 🟠 other 4xx = non-standard response
- Results displayed in a filterable table with details for each payload

### Attack Categories (19 total)
SQL Injection, XSS, Path Traversal, Command Injection, SSRF, NoSQL Injection, Local File Inclusion, LDAP Injection, HTTP Request Smuggling, Open Redirect, Sensitive Files, CRLF Injection, UTF8/Unicode Bypass, XXE, SSTI, HTTP Parameter Pollution, Web Cache Poisoning, IP Bypass, User-Agent

### WAF Detection
- Auto-detect WAF type before testing (Cloudflare, AWS WAF, ModSecurity, Akamai, Imperva, F5 BIG-IP, etc.)
- Suggests specific bypass techniques based on detected WAF
- Can auto-switch to WAF-specific advanced payloads

### Advanced Payloads & Encoding
- WAF Bypass Payloads — double encoding, unicode, mixed case, comment injection, polyglot payloads
- Enhanced Payloads — modern evasion techniques
- Encoding Variations — URL, Unicode, HTML Entity, Hex, Octal, Base64 encoding with automatic combinations
- WAF-specific bypasses for Cloudflare, AWS WAF, ModSecurity

### HTTP Protocol Manipulation
- HTTP Verb Tampering — test uncommon HTTP methods
- Parameter Pollution — duplicate and split parameters across query/body
- Content-Type Confusion — alternate content types to bypass rules
- Request Smuggling headers
- Host Header Injection variations
- HTTP Method Override via headers (X-HTTP-Method-Override, etc.)

### Batch Testing
- Test multiple URLs at once (up to 100)
- Configurable concurrency and delay between requests
- Real-time progress tracking with ETA
- Inherit current test settings or use defaults

### Export & Analytics
- Export results as JSON, CSV, or HTML Report
- Vulnerability scoring per category (Critical / High / Medium / Low)
- Executive summary with overall WAF effectiveness score
- Visual analytics dashboard

### Additional Options
- Follow 3xx redirects
- Case-sensitive testing
- False Positive testing (sends legitimate payloads to check for false blocks)
- Custom HTTP headers
- Request body template with `{PAYLOAD}` placeholder for POST/PUT
- Dark / Light theme toggle

## How to Use

1. Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (requires Node.js & npx)
2. Run from the project root:
   ```bash
   npx wrangler dev
   ```
   ![](./img/1-run.png)

## Project Structure

### Server (TypeScript)
- `app/src/api.ts` — main server: request routing, `/api/check` endpoint, payload sending logic
- `app/src/payloads.ts` — base attack categories and payloads
- `app/src/advanced-payloads.ts` — advanced WAF bypass payloads (double encoding, unicode, polyglot)
- `app/src/waf-detection.ts` — WAF fingerprinting and detection from response headers/behavior
- `app/src/encoding.ts` — payload encoding, obfuscation, and WAF-specific bypass utilities
- `app/src/http-manipulation.ts` — HTTP protocol manipulation (verb tampering, parameter pollution, smuggling)
- `app/src/reporting.ts` — result export (JSON/CSV/HTML), vulnerability scoring, executive summary
- `app/src/batch.ts` — batch URL testing with concurrency control and progress tracking

### Frontend
- `app/src/static/index.html` — web interface (Bootstrap 5, Inter font)
- `app/src/static/main.js` — UI logic, WAF detection display, batch testing, export, analytics
- `app/src/static/style.css` — custom styling and dark/light theme support
- `app/src/static/favicon.svg` — site icon

### Config
- `wrangler.toml` — root Wrangler config (used for `npx wrangler dev` from project root, includes static assets binding)
- `app/wrangler.jsonc` — app-level Wrangler config
- `app/tsconfig.json` — TypeScript configuration
- `app/vitest.config.mts` — test runner config

## Extending Payloads

Edit `app/src/payloads.ts` to add or modify base payloads. For advanced bypass payloads, edit `app/src/advanced-payloads.ts`. Each category has:
- `type` — where to inject: `ParamCheck` (query/body params), `FileCheck` (URL path), `Header` (HTTP headers)
- `payloads` — attack payloads
- `falsePayloads` — legitimate payloads for false positive testing

## Deployment

The project can be deployed as a Cloudflare Worker or run locally on any platform supporting the Fetch API. Requires Node.js.

```bash
# Local development
npx wrangler dev

# Deploy to Cloudflare
npx wrangler deploy
```

---

Repository: [github.com/7vik-dev/waf-checker](https://github.com/7vik-dev/waf-checker)
