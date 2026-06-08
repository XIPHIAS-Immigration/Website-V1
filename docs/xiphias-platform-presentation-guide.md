# XIPHIAS Platform Presentation Guide

## Demo URL

Local dev server:

```txt
http://localhost:4000
```

Portal:

```txt
http://localhost:4000/x-hub/sign-in
```

Use `localhost`, not `127.0.0.1`, because local auth callbacks are configured to port 4000 on localhost.

## Demo Accounts

```txt
Admin:   admin@xiphias.local / xiphias-admin
Client:  client@xiphias.local / xiphias-client
Partner: partner@xiphias.local / xiphias-partner
B2G:     mobility@gov.local / xiphias-b2g
```

## Presentation Flow

1. Open `/x-hub/sign-in` and sign in as Admin.
2. Show `/x-hub` for the XIPHIAS Hub feature map, client case, milestones, documents, and secure upload.
3. Show `/x-hub/imt` for the Investment + Migration Tracker.
4. Show `/x-hub/xia` for XIA Lite, the no-LLM advisory layer.
5. Show `/x-hub/x-passport` for program ranking by budget, region, family, and timeline.
6. Show `/x-hub/admin/operations` for staff pipeline management.
7. Show `/x-hub/admin/risk` for due diligence, risk flags, and compliance screening.
8. Show `/x-hub/admin/content-review` for AI-style content update drafts with approval before publish.
9. Show `/x-hub/partners` for partner referrals.
10. Show `/x-hub/b2g` for institutional/B2G intake.
11. Show `/x-hub/admin/health` for storage, SMTP, WhatsApp, compliance, and upload readiness.

## What Is Now Demo-Ready

- File-backed platform data store for local persistence.
- XIPHIAS Hub portal with roles for client, staff, admin, partner, and B2G users.
- Secure document upload route and portal upload UI.
- Staff operations console for leads, cases, documents, partner referrals, and B2G inquiries.
- Due diligence and risk console with deterministic checks.
- Compliance vendor adapter with explicit demo fallback when no vendor is configured.
- WhatsApp Cloud API wrapper, webhook, and staff test endpoint.
- SMTP-backed partner/B2G acknowledgements when SMTP env vars are configured.
- Content review workflow with create, approve, reject, and mark-published states.
- XIA Lite and X-Passport remain LLM-free.

## Credential-Dependent Items

These are wired but require live credentials before production use:

- WhatsApp: `META_WABA_TOKEN`, `META_WABA_PHONE_NUMBER_ID`, `WHATSAPP_TO`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, recipient env vars.
- Compliance vendor: `COMPLIANCE_VENDOR_ENDPOINT`, `COMPLIANCE_VENDOR_API_KEY`, `COMPLIANCE_VENDOR_NAME`.
- Production storage: replace local file upload/store paths with managed Postgres and object storage.
