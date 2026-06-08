# XIPHIAS Website Platform Handoff

Last updated: 2026-06-08

## Current Goal

The website was extended for the next development phase while keeping the existing Topmate booking/payment flow untouched. The platform is now presentation-ready as a functional MVP foundation for WhatsApp, XIA Lite, XIPHIAS Hub, Mobility OS, Document Intelligence, IMT, risk intelligence, content review automation, X-Passport, and B2B/B2G workflows.

It is not a finished enterprise production system yet. Live credentials, managed database/storage, and vendor integrations are still required before launch.

## How To Run

From the project root:

```powershell
cd E:\Xiphias_immigration_website
npm install
npm run dev
```

Open:

```txt
http://localhost:4000
```

Use `localhost` for portal login. Auth callbacks are configured to `http://localhost:4000`; using `127.0.0.1` can trigger cross-origin dev warnings.

Useful checks:

```powershell
npm run typecheck
npm run build
```

If `npm run build` fails on Windows with an `.next` file lock, stop any running dev server/node process, then rerun the build.

## Demo Portal Login

These accounts work in local development:

```txt
Admin:   admin@xiphias.local / xiphias-admin
Client:  client@xiphias.local / xiphias-client
Partner: partner@xiphias.local / xiphias-partner
B2G:     mobility@gov.local / xiphias-b2g
```

Portal entry:

```txt
/x-hub/sign-in
```

Local `.env.local` should include:

```txt
NEXTAUTH_URL=http://localhost:4000
AUTH_URL=http://localhost:4000
```

## New Website / Portal Sections

### XIPHIAS Hub

Route:

```txt
/x-hub
```

Purpose:

- Client/staff/admin portal dashboard.
- Shows active case, primary advisor, next action, progress, documents, milestones, leads, and risk reviews.
- Client users can upload requested/rework documents from here.
- The dashboard now includes a "What each section does" feature map with role-specific cards for Client Profile, Mobility OS, Document Intelligence, Case Tracker, XIA Advisor, X-Passport, Risk Review, Operations, Partner Desk, B2G Desk, and Content Review.
- User-facing naming is now "XIPHIAS Hub"; the route remains `/x-hub` for compatibility.

### Client Profile

Route:

```txt
/x-hub/profile
/api/platform/profile
```

Purpose:

- Single client profile workspace tied to `clientId`.
- Editable after login by the client, and viewable/editable by staff/admin for the selected client workspace.
- Connects portal user, client profile, active cases, documents, milestones, risk reviews, lead history, and portal conversations in one page.
- Local MVP persistence writes to `.xiphias-platform/platform-store.json` under `clientProfiles`.
- Future CRM/Postgres sync should map CRM contact/account IDs to this same `clientId` relationship.

Data relationship:

```txt
PlatformUser -> clientId -> ClientProfile
ClientProfile/clientId -> MigrationCase
MigrationCase/caseId -> Documents, Milestones, Risk, Conversations
MigrationCase/leadId -> Lead history and source records
```

Main files:

```txt
src/app/x-hub/profile/page.tsx
src/app/api/platform/profile/route.ts
src/components/Platform/ClientProfileWorkspace.tsx
src/lib/platform/types.ts
src/lib/platform/repository.ts
```

### Mobility OS

Route:

```txt
/x-hub/mobility-os
```

Purpose:

- Premium portal command center for client journey intelligence.
- Works without CRM sync by using existing Hub case, document, risk, content-review, and approved website-content data.
- Calculates journey readiness, current IMT stage, document gaps, regulation/content signals, blockers, next best actions, and automation triggers.
- Uses a CSS-only animated score ring and fixed-card layouts to avoid public-page LCP/CLS impact.
- Public floating chat/enquiry widgets are suppressed on `/x-hub` routes so they do not overlap authenticated app screens.

Main files:

```txt
src/app/x-hub/mobility-os/page.tsx
src/components/Platform/MobilityOSView.tsx
src/lib/platform/mobility-os.ts
src/lib/platform/regulation-radar.ts
```

### Document Intelligence

Route:

```txt
/x-hub/documents
/api/platform/document-plan
```

Purpose:

- Route-specific evidence planner for clients, staff, and admins.
- Generates a deterministic checklist by pathway, country, and program.
- Flags critical missing evidence, overdue document actions, rework/mismatch notes, and source-of-funds gaps.
- Produces automation-ready actions for WhatsApp nudges, advisor review, portal checklist sync, and evidence-trail emails.
- Does not require CRM sync; it reads current Hub documents and can also generate a plan from manually entered track/country/program.

Main files:

```txt
src/app/x-hub/documents/page.tsx
src/app/api/platform/document-plan/route.ts
src/components/Platform/DocumentIntelligenceClient.tsx
src/lib/platform/document-intelligence.ts
```

### IMT - Investment + Migration Tracker

Route:

```txt
/x-hub/imt
```

Purpose:

- Shows the migration/investment journey stage by stage.
- Tracks intake, documents, due diligence, strategy, filing, government review, decision, and post-approval.

### XIA Lite

Route:

```txt
/x-hub/xia
```

Purpose:

- No-LLM advisory tool.
- Uses deterministic intent detection, rule scoring, and content retrieval from approved website content.
- Recommends routes and actions with source-backed outputs.

### X-Passport Engine

Route:

```txt
/x-hub/x-passport
```

Purpose:

- Ranks countries/programs by user priorities such as region, budget, timeline, family inclusion, and mobility goals.
- This is a deterministic ranking engine, not an LLM.

### XIPHIAS Passport Index

Route:

```txt
/passport-index
```

Purpose:

- Public-facing premium passport mobility index inspired by the experience quality of global passport ranking sites, but with original XIPHIAS blue/gold styling.
- Lets users compare a current passport against a target passport, search/filter the curated mobility table, and move into eligibility, advisor booking, or X-Passport planning.
- Uses structured static data in `src/data/passport-index.ts`; later this can be replaced with a licensed feed, SQL table, or admin-managed content.
- Linked from the main Resources menu as "Passport Index".

### Partner Portal

Route:

```txt
/x-hub/partners
```

Purpose:

- Partner users can submit referrals.
- Staff/admin users can view partner referral pipeline.
- SMTP acknowledgement is wired when email env vars are configured.

### B2G Portal

Route:

```txt
/x-hub/b2g
```

Purpose:

- Institutional/B2G intake flow.
- Captures organization, contact, region, volume estimate, and requirement.
- SMTP acknowledgement is wired when email env vars are configured.

### Operations Console

Route:

```txt
/x-hub/admin/operations
```

Purpose:

- Staff/admin pipeline management.
- Can update lead status, case stage/progress, document status, partner referral status, and B2G status.
- Good presentation page to show staff workflow.

### Risk Review

Route:

```txt
/x-hub/admin/risk
```

Purpose:

- Due diligence/risk intelligence layer.
- Checks missing identity, source-of-funds gaps, document name mismatches, PEP declarations, and sanctions hits.
- Includes compliance vendor adapter. If no vendor env vars are configured, it clearly runs in demo mode.

### Content Review

Route:

```txt
/x-hub/admin/content-review
```

Purpose:

- Creates source-backed content update tasks.
- Supports reviewer notes, approve, reject, and mark-published flow.
- No auto-publish. Human approval remains mandatory.
- Regulation Radar now reuses approved website content plus content-review tasks to surface route/country signals inside Mobility OS.

### Platform Health

Route:

```txt
/x-hub/admin/health
```

Purpose:

- Shows readiness of local storage, SMTP, WhatsApp, compliance vendor, and upload configuration.
- Includes WhatsApp test button. It only sends if Meta WhatsApp credentials are configured.

### Public Eligibility Section

Route:

```txt
/eligibility
```

Purpose:

- Existing eligibility flow was improved with content-backed advisory results.
- It now creates platform leads and feeds into the no-LLM advisory layer.
- The lead gate is now a premium assessment funnel: users enter name/email/phone, receive a branded SMTP "assessment trailer" email, and see a free preview result on the website.
- Header navigation includes a `Get Started` CTA beside the consultation button. It links to `/eligibility#start` so users land directly inside the guided step-by-step assessment frame.
- The preview PDF is intentionally labeled `Assessment Preview Report`; it includes summary, route direction, criteria, sources, user inputs, and a paid detailed-report CTA.
- The preview PDF template now uses the bundled XIPHIAS logo, blue/gold cover styling, route imagery where PDF-compatible assets exist, flag imagery, icon-style cards, cleaner spacing, and a 3-page premium assessment layout.
- The detailed personal report is positioned as a 20-30 page paid deliverable after registration. Default registration price is INR 10,000 and the CTA uses `/registration`, which redirects to a dedicated Topmate registration product when `TOPMATE_REGISTRATION_URL` is configured.
- Current status: the preview/trailer/report CTA flow is implemented. The paid registration handoff now creates a Hub client account, case, document checklist, milestones, risk review record, and credential email after payment confirmation.

Main files:

```txt
src/components/Eligibility/LeadGate.tsx
src/components/Eligibility/ResultCard.tsx
src/app/api/eligibility/submit/route.ts
src/app/api/eligibility/report/route.ts
```

### Paid Registration + Hub Provisioning

Routes:

```txt
/registration
/api/platform/registration/provision
/x-hub/account
/api/platform/account/change-password
```

Purpose:

- Keeps consultation booking on the existing `/booking` Topmate flow.
- Adds a separate `/registration` redirect for the INR 10,000 detailed assessment/report registration product.
- The actual Topmate registration product must be created inside Topmate manually. Paste its URL into `TOPMATE_REGISTRATION_URL`.
- After payment, Topmate/Zapier/Make/manual admin automation should POST customer details to `/api/platform/registration/provision`.
- Provisioning creates or updates a client Hub account, generates a temporary password when needed, opens a case, assigns onboarding documents, creates IMT milestones, creates a staff-review risk record, and sends the client login email through SMTP.
- Clients sign in at `/x-hub/sign-in`, review progress/documents in XIPHIAS Hub, and change the temporary password at `/x-hub/account`.

Example provisioning payload:

```json
{
  "secret": "same value as XIPHIAS_REGISTRATION_WEBHOOK_SECRET",
  "name": "Client Name",
  "email": "client@example.com",
  "phone": "+919999999999",
  "track": "residency",
  "country": "United States",
  "program": "USA EB-5 Residency",
  "paymentReference": "topmate_payment_or_booking_id",
  "amount": 10000
}
```

Security:

- In production, set `XIPHIAS_REGISTRATION_WEBHOOK_SECRET`. The provisioning endpoint rejects requests without the matching secret.
- In local development, the endpoint allows missing secret for demos only.

### Public Chatbot / XIA Lite Widget

Visible on public pages as the floating chat/advisor widget.

Purpose:

- Card-based guided concierge.
- Offers program browsing, country coverage, route finder, document/process help, business/partner actions, and advisor booking.
- Uses XIA Lite internally by default.
- Text input is always available so users can communicate naturally.
- Responses are intentionally compact: short conversational answer, 2-3 route cards, and follow-up prompt.
- Route shortlists use curated program catalog rules before broad content retrieval, avoiding random blog/news recommendations.
- Greeting/small-talk messages are handled before retrieval, so "hi" does not trigger random program results.
- Optional server-side conversation model adapter exists for warmer phrasing.

Future option:

- Enable `XIA_CONVERSATION_MODEL_PROVIDER=ollama` for a local tiny model service, or `openai-compatible` for a hosted small chat endpoint.
- Recommended tiny local shape: Ollama-compatible small instruct model running server-side only.
- The small model should only rewrite the answer tone from approved XIA facts. It must not invent program rules, fees, guarantees, or timelines.

## Mapping To Initial Demand

### WhatsApp Integration

Implemented:

- WhatsApp Cloud API send wrapper.
- Lead alert hook.
- Inbound webhook capture.
- Admin test endpoint and health status.

Main files:

```txt
src/lib/platform/whatsapp.ts
src/app/api/platform/whatsapp/webhook/route.ts
src/app/api/platform/whatsapp/test/route.ts
```

Production need:

- Configure Meta credentials and verify webhook on deployed domain.

### AI Tool Integration For Chatbot

Implemented without LLMs:

- XIA Lite deterministic advisor.
- Content retrieval/RAG-style matching over approved site content.
- Card-based guided chatbot UI.
- Country-specific behavior avoids substituting unrelated countries.

Main files:

```txt
src/components/ChatWidget.tsx
src/lib/platform/xia.ts
src/lib/platform/content-rag.ts
src/app/api/platform/xia/route.ts
```

Production need:

- Keep expanding curated content snippets, route rules, and staff handoff logic.

### Multi-Currency Payment Gateway

Skipped intentionally.

Reason:

- Existing booking/payment redirects to Topmate and remains the source of truth for paid consultation/payment.
- No Razorpay/Stripe/internal checkout was added.

### AI Auto Content Update

Implemented as human-approved workflow:

- Content review draft creation.
- Reviewer notes.
- Approve/reject.
- Mark published only after approval and target path exists.
- Regulation radar uses approved website content and content-review tasks to identify route/country signals for staff attention.

Main files:

```txt
src/lib/platform/content-review.ts
src/components/Platform/ContentReviewClient.tsx
src/app/api/platform/content-review/route.ts
src/app/x-hub/admin/content-review/page.tsx
src/lib/platform/regulation-radar.ts
```

Production need:

- Add real source monitoring/crawler and stronger publication process.

### Due Diligence & Risk Intelligence Layer

Implemented:

- Deterministic risk checks.
- Document completeness/mismatch flags.
- Source-of-funds checks.
- PEP/sanctions compliance adapter.
- Staff/admin risk review page.

Main files:

```txt
src/lib/platform/risk.ts
src/lib/platform/compliance.ts
src/components/Platform/RiskReviewClient.tsx
src/app/api/platform/risk/route.ts
src/app/x-hub/admin/risk/page.tsx
```

Production need:

- Connect real PEP/sanctions vendor.

### XIA - XIPHIAS Intelligent Advisor

Implemented:

- Portal XIA page.
- Chat widget XIA Lite integration.
- Eligibility advisory integration.
- Content-first no-LLM recommendation flow.

Main files:

```txt
src/app/x-hub/xia/page.tsx
src/components/Platform/XiaAdvisorClient.tsx
src/lib/platform/xia.ts
src/lib/platform/eligibility-advisor.ts
```

### XIPHIAS Hub Mobile Suite

Implemented as responsive portal/PWA-style web foundation:

- Client portal.
- Role-based navigation.
- Document checklist.
- Secure upload.
- Messages/conversations in platform repository.
- Case milestones and next actions.
- Client Profile gives one editable client record linked to cases, documents, milestones, risk, leads, and conversations by `clientId`.
- Mobility OS gives a premium command-center view over case journey, document intelligence, risk, content signals, and automations.
- Document Intelligence gives route-specific checklists and automation-ready reminders without CRM sync.

Main files:

```txt
src/app/x-hub/page.tsx
src/components/Platform/PortalShell.tsx
src/components/Platform/DocumentUploadForm.tsx
src/app/api/platform/documents/upload/route.ts
src/app/x-hub/profile/page.tsx
src/app/x-hub/mobility-os/page.tsx
src/app/x-hub/documents/page.tsx
```

Production need:

- Native apps are not built. This is web-first responsive portal.
- Replace local file storage with object storage.

### Investment + Migration Tracker

Implemented:

- Stage tracker.
- Document progress.
- Risk status.
- Staff can update case stage/progress from Operations Console.

Main files:

```txt
src/app/x-hub/imt/page.tsx
src/app/x-hub/admin/operations/page.tsx
src/app/api/platform/admin/workflow/route.ts
```

### Global Mobility Index / X-Passport Engine

Implemented:

- Deterministic program ranking.
- Uses region, budget, timeline, family inclusion, and priorities.

Main files:

```txt
src/lib/platform/passport.ts
src/components/Platform/PassportEngineClient.tsx
src/app/api/platform/passport/route.ts
src/app/x-hub/x-passport/page.tsx
```

Production need:

- Add real passport strength / mobility index data source if required.

### B2B & B2G Partnership Portal

Implemented:

- Partner referral form and portal.
- B2G/institutional intake form and portal.
- Staff/admin operations console to update statuses.
- SMTP admin + acknowledgement emails when configured.

Main files:

```txt
src/components/Platform/PartnerReferralForm.tsx
src/components/Platform/B2GIntakeForm.tsx
src/app/api/platform/partner-referrals/route.ts
src/app/api/platform/b2g-intake/route.ts
src/app/x-hub/partners/page.tsx
src/app/x-hub/b2g/page.tsx
```

## Platform Data Layer

Current local/demo mode:

- Uses a file-backed platform store.
- Default file path:

```txt
.xiphias-platform/platform-store.json
```

This folder is ignored by git because it is runtime/demo data.

Main files:

```txt
src/lib/platform/repository.ts
src/lib/platform/types.ts
src/lib/platform/seed.ts
docs/xiphias-platform-postgres-schema.sql
```

Production need:

- Replace file-backed/local repository with Postgres using the schema draft in `docs/xiphias-platform-postgres-schema.sql`.

## Legacy CRM Migration

The CRM conversion discovery pass is documented here:

```txt
docs/xiphias-crm-migration-inventory.md
```

Current CRM source conclusion:

- `G:\jun\XCRM` is the authoritative ASP.NET MVC/.NET Framework source tree.
- `G:\jun\CRM_Email` looks like a deployment/email-focused copy.
- `G:\2026-06-01\XIPHIAS_IMMIGRATION` looks like a deployed IIS snapshot with uploads/templates and should not be treated as clean source.

Important CRM facts:

- Legacy CRM is ASP.NET MVC 5 on .NET Framework 4.8 with EF6 EDMX, direct SQL Server stored procedure calls, WCF services, scheduled task manager, SMTP email, SMS helpers, Rotativa PDFs, and legacy payment code/config.
- No clean `.bak`, `.mdf`, `.dacpac`, or `.bacpac` database export was found in the controlled source scan.
- A production-grade conversion needs SQL Server read access, a DB backup/export, or a generated SQL schema/procedure script.
- CRM should be ported module by module into Next.js/React/Node, beginning with Opportunity leads and Client Profile, then documents/cases, assessment, communication, system masters, accounts, reports, and scheduled jobs.

## Environment Variables

Template:

```txt
.env.example
```

Important production envs:

```txt
NEXTAUTH_SECRET=
NEXTAUTH_URL=
XIPHIAS_PORTAL_USERS=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
EMAIL_TO=
PARTNER_EMAIL_TO=
B2G_EMAIL_TO=
NEXT_PUBLIC_ASSESSMENT_REPORT_PRICE_INR=
NEXT_PUBLIC_ASSESSMENT_REPORT_PAYMENT_URL=
ASSESSMENT_REPORT_PRICE_INR=
ASSESSMENT_REPORT_PAYMENT_URL=
TOPMATE_REGISTRATION_URL=
NEXT_PUBLIC_TOPMATE_REGISTRATION_URL=
XIPHIAS_REGISTRATION_WEBHOOK_SECRET=
META_WABA_TOKEN=
META_WABA_PHONE_NUMBER_ID=
WHATSAPP_TO=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
XIA_CONVERSATION_MODEL_PROVIDER=
XIA_CONVERSATION_MODEL_ENDPOINT=
XIA_CONVERSATION_MODEL=
XIA_CONVERSATION_MODEL_API_KEY=
COMPLIANCE_VENDOR_NAME=
COMPLIANCE_VENDOR_ENDPOINT=
COMPLIANCE_VENDOR_API_KEY=
DATABASE_URL=
XIPHIAS_UPLOAD_DIR=
```

## Verification Already Done

Passed in the latest Mobility OS / Document Intelligence update:

```txt
npm run typecheck
```

Earlier full build verification was recorded in this handoff. If Windows locks `.next`, stop the running dev server/node process before rerunning `npm run build`.

Browser smoke-tested:

```txt
/x-hub/admin/operations
/x-hub/admin/risk
/x-hub/admin/content-review
/x-hub/admin/health
/x-hub
/x-hub/profile
/x-hub/mobility-os
/x-hub/documents
/crm
```

Also tested:

- Admin sign-in.
- Risk review creation.
- Secure upload UI visibility.
- Platform store creation.
- Client Profile render, profile API save, and local store persistence under `clientProfiles`.
- Mobility OS render, no console errors, no horizontal overflow, and no public floating chat overlap on portal routes.
- Document Intelligence render and document-plan API generation, no console errors, no horizontal overflow.
- CRM Migration Console render, legacy module map visible, no console errors, no horizontal overflow at default viewport.

## Known Gaps Before Production

- Replace file-backed repository with Postgres.
- Replace local upload directory with managed object storage.
- Configure real WhatsApp credentials and deploy webhook publicly.
- Configure SMTP credentials.
- Connect real PEP/sanctions vendor.
- Add production user management and password/token rotation.
- Expand staff dashboards and audit/report exports.
- Add stronger content source monitoring and publication controls.
- Connect Regulation Radar to live government/source monitoring or a licensed immigration/regulatory feed.
- Add real global mobility/passport strength data source if required.
- Create the INR 10,000 Topmate registration product in Topmate and set `TOPMATE_REGISTRATION_URL`.
- Connect Topmate payment completion to `/api/platform/registration/provision` through Topmate webhooks, Zapier, Make, or a small admin automation.
- Generate/unlock the full 20-30 page personal assessment report inside XIPHIAS Hub after the paid registration case is opened.
- Get live SQL Server schema/backup or read-only DB credentials before exact CRM data migration.
- Start CRM conversion from `docs/xiphias-crm-migration-inventory.md`, using `G:\jun\XCRM` as the primary source.

## Suggested New-Chat Prompt

Use this if starting a new Codex chat:

```txt
We are working in E:\Xiphias_immigration_website. Read docs/xiphias-project-handoff.md and docs/xiphias-crm-migration-inventory.md first. The app is a Next.js immigration website. Payment gateway work is intentionally skipped because Topmate handles booking/payment. Consultation stays on /booking. Paid INR 10,000 report registration uses /registration plus /api/platform/registration/provision to create Hub client credentials, client profile, case, documents, and milestones after payment. Continue from the platform MVP: XIPHIAS Hub, Client Profile, Mobility OS, Document Intelligence, XIA Lite, IMT, Risk Review, Content Review, WhatsApp, Partner/B2G portals, X-Passport, Passport Index, and the eligibility assessment trailer funnel. CRM conversion is now the next architecture track: use G:\jun\XCRM as the primary legacy source, not the deployment folders, and port the ASP.NET MVC CRM module-by-module into Next.js/React/Node with Prisma/Postgres after SQL Server schema/backup access is available. Keep public pages fast, keep portal features isolated/lazy where possible, keep XIA v1 deterministic/source-backed unless an optional small server-side model is explicitly configured, and avoid internal Razorpay/Stripe/payment gateway work unless explicitly requested.
```
