# Environment reference

Three files, three jobs. Getting these mixed up is why X-Hub signs in on the live
site but not on your machine.

| File | Loaded when | In git? | Holds |
|---|---|---|---|
| `.env.example` | never | yes | The documented list of every key. No real values. |
| `.env.local` | `npm run dev` on your machine | **no** (`.gitignore`: `.env*.local`) | Your local secrets. Created 13 Sep 2026. |
| `.env.production` | production build | **no** | Currently holds placeholder text (`your-admin@…`). The real production values live in a `.env.local` on the server, not in this repo. |

Next.js loads `.env.local` last, so it overrides everything else in development.

## Signing in to X-Hub locally

```
URL       http://localhost:4000/x-hub/sign-in
Email     admin@xiphias.local
Password  XiphiasLocal#2026
```

The password is stored as a SHA-256 hash in `XIPHIAS_ADMIN_PASSWORD_SHA256`, never
in plain text. To change it:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('NEW_PASSWORD').digest('hex'))"
```

Paste the result into `XIPHIAS_ADMIN_PASSWORD_SHA256` and restart the dev server.

### Where portal passwords actually live

`src/lib/platform/auth.ts` → `parsePortalUsers()` checks two stores, in order:

1. **Environment** — `XIPHIAS_PORTAL_USERS` (a JSON array of
   `{email, name, role, passwordSha256}`) or the single-admin fallback
   `XIPHIAS_ADMIN_EMAIL` + `XIPHIAS_ADMIN_PASSWORD_SHA256`.
2. **Disk** — clients provisioned through `/api/platform/registration/provision`
   get a `passwordSha256` written into the JSON file at
   `XIPHIAS_PLATFORM_STORE_PATH` (default `.xiphias-platform/platform-store.json`).

If neither store has any user, the sign-in button renders disabled with
"Portal access is not configured" — that was the local symptom before this file
existed.

`XIPHIAS_ADMIN_PASSWORD` (plain text) is still accepted by the code for backward
compatibility. Do not use it. It is scheduled for removal in the auth-hardening
phase, along with a move from SHA-256 to bcrypt.

## Turning on the XIA language model

The AI layer is off by default: `XIA_CONVERSATION_MODEL_PROVIDER=rules` makes
`generateConversationalSummary()` return `null` and the deterministic engine
answers instead. Nothing breaks with no token.

### The three models

One key, one endpoint, three models — because the three jobs are not equally
hard and paying the reasoning price to read a job title off a CV is money burnt.

| Task | Env var | Default model | Used by |
|---|---|---|---|
| reasoning | `XIA_MODEL_REASONING` | `openai/gpt-oss-120b:cheapest` | The concierge deciding what to ask next and where to send someone |
| extraction | `XIA_MODEL_EXTRACTION` | `meta-llama/Llama-3.1-8B-Instruct:cheapest` | Reading an opening sentence or an uploaded CV into fields |
| writing | `XIA_MODEL_WRITING` | `openai/gpt-oss-20b:cheapest` | Rephrasing a completed assessment in plain English |

All three are optional. Leave them unset and everything falls back to
`XIA_CONVERSATION_MODEL`. The `:cheapest` suffix lets the HF router pick the
lowest-priced provider currently serving that model, so you are not pinned to
one vendor's price.

To switch it on:

1. Create a token at <https://huggingface.co/settings/tokens> — **Fine-grained**,
   with **Make calls to Inference Providers** ticked. No other scope is needed.
2. At <https://huggingface.co/settings/billing>, enable automatic recharge and set
   the spend limit to **USD 15**. A free account includes only $0.10/month of
   credit, which covers testing and nothing more. Skip PRO — $9/month buys $2 of
   credit, so pay-as-you-go is cheaper for pure inference.
3. In `.env.local`, paste the token into `XIA_CONVERSATION_MODEL_API_KEY` and
   change `XIA_CONVERSATION_MODEL_PROVIDER` from `rules` to `openai-compatible`.
4. Restart the dev server.

The key is read in `src/lib/platform/conversation-model.ts`, which is
`server-only` — it never reaches the browser. Never put it in a
`NEXT_PUBLIC_*` variable.

### Cost at a glance

Priced on `openai/gpt-oss-120b` routed to the cheapest provider
($0.037 input / $0.17 output per million tokens, September 2026, no HF markup).

| Workload | Per run | 1,000 / month | 10,000 / month |
|---|---|---|---|
| Assessment explained | $0.0002 | $0.21 | $2.13 |
| CV parsed to JSON | $0.0002 | $0.17 | $1.68 |
| Chat session (~20 turns) | $0.0018 | $1.79 | $17.90 |

The `:cheapest` suffix re-routes automatically if a cheaper provider appears.

## Keys deliberately left unset locally

`JIOPAY_*`, `XIPHIAS_CRM_SQL_*`, `SMTP_*`, `META_WABA_*` — so a local run can
never charge a card, write to the production CRM, or send mail to a real client.
Copy individual keys from `.env.example` when you need to test that path.
