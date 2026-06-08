# XIPHIAS Legacy CRM Migration Inventory

Last updated: 2026-06-08

## Purpose

This note records the current discovery pass for converting the legacy XIPHIAS CRM from ASP.NET MVC/.NET Framework into the current Next.js/React/Node platform.

The goal is not to blindly copy screens. The goal is to preserve the CRM workflows, data relationships, email/SMS behavior, client tracking, document processing, assessment flow, and reporting in a modern stack that can link cleanly with Xiphias Hub.

## Source Folders Checked

### `G:\jun\XCRM`

This is the authoritative source tree.

Evidence:
- Contains `XCRM.sln`.
- Contains multiple C# projects:
  - `XIPHIAS` - main ASP.NET MVC CRM web application.
  - `XIPHIAS.Services` - shared service library, including email and SMS helpers.
  - `XIPHIAS.WCFServices` - WCF service project with EDMX model.
  - `XIPHIAS.Services.ScheduleTaskManager` - scheduled/background mail/task project with EDMX model.
  - `XIPHIAS.Handlers` - handler project.
  - `LiveChatApi` and `LiveChatApiExample` - legacy live chat API integration.
- Uses Team Foundation Server metadata pointing to a legacy XIPHIAS CRM source control server.

### `G:\jun\CRM_Email`

This appears to be a deployment/copy of the CRM focused around email/communication behavior.

Evidence:
- No `.sln` found in the controlled scan.
- Contains `Areas`, `Controllers`, `Views`, `bin`, `Web.config`, and `packages.config`.
- Config keys match the main CRM deployment-style app.
- Useful as a comparison copy for email behavior, but not the primary migration source.

### `G:\2026-06-01\XIPHIAS_IMMIGRATION`

This appears to be a deployed IIS application snapshot, likely the current/production CRM package.

Evidence:
- Contains `Web.config`, `bin`, `bin-OLD`, `AgreementTemps`, `Files`, `ExcelFiles`, `Rotativa`, `Views`, `Areas`, `WCFServices`, and private upload folders.
- Contains uploaded/private CRM documents and agreement files, so it should not be treated as clean source.
- Useful for confirming deployed config and static templates.
- Not ideal as the primary conversion base.

## Legacy Technology Stack

- ASP.NET MVC 5 on .NET Framework 4.8.
- Entity Framework 6.2 with EDMX models.
- Direct SQL Server access through `SqlConnection`, `SqlCommand`, and stored procedures.
- ASP.NET Identity/Owin authentication.
- DotNetOpenAuth/Facebook OAuth packages.
- WCF services.
- Rotativa for PDF generation.
- RestSharp and `openstack.net` for external/API/CDN style integrations.
- SMTP email via `System.Net.Mail.SmtpClient`.
- SMS via custom `SMSSender`.
- Legacy payment integrations are present in config/code, including PayU/PayPal/EBS/Atom/Paytm-style keys. For the website phase, Topmate remains the payment source of truth unless management decides otherwise.

## Main MVC Module Map

The main source project is `G:\jun\XCRM\XIPHIAS`.

Area/controller/view count:

| Area | Controllers | Views | Main responsibility |
| --- | ---: | ---: | --- |
| Accounts | 21 | 63 | invoices, receipts, refunds, expenses, commission, outstanding amounts, payment approvals |
| Administration | 5 | 18 | roles, users, access control, page access |
| Assessment | 8 | 29 | express assessment, assessment points, assessment clients, assessed content, assessment mail |
| Clients | 22 | 68 | client records, applications, documents, approvals, agreements, case updates, notes, logs |
| Communication | 10 | 28 | bulk mail, simple mail, email API/sync, courier, gallery, news, testimonials |
| Events | 5 | 19 | event details, attendees, tickets, guest tickets |
| Help | 5 | 20 | support, FAQ, blog posts, official updates |
| Opportunity | 21 | 59 | leads, enquiries, appointments, opportunities, tasks, call tracking, live chat, references |
| Reporting | 3 | 4 | coordinator reports, task reports, assessment point reports |
| System | 30 | 123 | master data: branches, countries, programs, fees, docs, SMTP, SMS, templates, tax, sources |
| CMS | 0 | 0 | present as area shell only |

Key root controllers also exist outside areas, including account, client, enquiry, payment, PDF download, registration, search, transfer fund, user ratings, and reminders.

## Database Findings

No clean `.bak`, `.mdf`, `.dacpac`, or `.bacpac` database file was found in the controlled source scan.

Config files contain SQL Server connection strings, but values were not copied into this note. Connection names found:

- `DefaultConnection`
- `myConnectionString`
- `ImmigrationPortalEntities`
- `ScheduleConnection`
- Excel import strings: `Excel03ConString`, `Excel07ConString`

EDMX models found:

- `G:\jun\XCRM\XIPHIAS.WCFServices\Models\DataModels.edmx`
  - 81 entity types.
  - Includes client, application, document, invoice, email, event, support, payment, SMS, and SMTP entities/views.
- `G:\jun\XCRM\XIPHIAS.Services.ScheduleTaskManager\Models\SDataContext.edmx`
  - 311 entity types.
  - This is the broader CRM schema model and should be the main schema reference until live SQL Server access or a DB backup is available.

Important tables found in EDMX include:

- Client/core: `tbl_Client`, `tbl_ClientContact`, `tbl_ClientUser`, `tbl_ClientFamily`, `tbl_ClientEducation`, `tbl_ClientLanguage`, `tbl_ClientOccupation`, `tbl_ClientBusiness`, `tbl_ClientWorkCanda`, `tbl_ClientPR`, `tbl_ClientTFW`.
- Cases/documents: `tbl_ClientApplications`, `tbl_ClientDocuments`, `tbl_ClientDocsApproval`, `tbl_ClientProcessingDocs`, `tbl_DocumentMaster`, `tbl_DocumentMapping`, `tbl_DocType`, `tbl_AgreementUpload`, `tbl_InitAgreement`, `tbl_AgreementTemplate`.
- Leads/opportunity: `tbl_Enquiry`, `tbl_LeadDetails`, `tbl_Opportunities`, `tbl_Tasks`, `tbl_TaskLog`, `tbl_Notes`, `tbl_SourceMaster`, `tbl_Associate`, `tbl_ReferencedClient`, `tbl_MissedCallData`.
- Assessment: `tbl_Assessment`, `tbl_Assessment_points`, `tbl_AssessmentCategory`, `tbl_AssessmentContent`, `tbl_AssessmentStatus`, `tbl_AssessedContent`, `tbl_ExpVisaPointCalculation`.
- Accounts/payments: `tbl_InvoiceDetails`, `tbl_Receipt`, `tbl_Refund`, `tbl_OnlinePayments`, `tbl_PayuResponse`, `tbl_PaymentMaster`, `tbl_FeeMaster`, `tbl_RegFee`, `tbl_MiscFee`, `tbl_SpecialInvoices`, `tbl_CommissionMaster`, `tbl_CommissionPay`, `tbl_CommissionPaymentDetails`.
- Communication: `tbl_EmailLog`, `tbl_EmailTemplates`, `tbl_BackgroundMailTemplates`, `tbl_PostAgreementMailLogs`, `tbl_PostAgreementTemplate`, `tbl_MailBox`, `tbl_MailBox_Detail`, `tbl_SMSConfig`, `tbl_SMTPConfig`, `tbl_DefaultMailer`, `tbl_MailingList`, `tbl_NewsLetter`, `tbl_NewsLetterUser`.
- System/master: `tbl_UserDetails`, `tbl_UserLog`, `tbl_AccessControl`, `tbl_AccessPageLevelControl`, `tbl_ModuleMaster`, `tbl_Branch`, `tbl_CountryMaster`, `tbl_ProgramMaster`, `tbl_ImmigrationProgram`, `tbl_ClientStatusMaster`, `tbl_ClientCategory`, `tbl_TaxCategory`, `tbl_PromoCode`.
- Support/content/events: `tbl_Support`, `tbl_SupportComments`, `tbl_SupportType`, `tbl_FAQ`, `tbl_Blog`, `tbl_NewsUpdate`, `tbl_OfficialUpdate`, `tbl_EventDetails`, `tbl_EventRegistration`, `tbl_EventTickets`, `tbl_ClientTestimonial`, `tbl_gallary`.

Stored procedures referenced in the source include:

`sp_AccessControl`, `sp_AgreementDocUpload`, `sp_ApproveAgreements`, `sp_ApproveApplications`, `sp_AssessedContent`, `sp_Assessment`, `sp_Assessment_points`, `sp_AssessmentContent`, `sp_AssessmentContent1`, `sp_AssessmentMailService`, `sp_AssessmentStatus`, `sp_ChangeClientPassword`, `sp_ClearLogs`, `sp_ClientBusiness`, `sp_ClientCategory`, `sp_ClientDocsEdit`, `sp_ClientEducation`, `sp_ClientFamily`, `sp_ClientLanguage`, `sp_ClientOccupation`, `sp_ClientProcessingDocs`, `sp_ClientRegister`, `sp_ClientSpouseOccupation`, `sp_ClientStatusMaster`, `sp_ClientUserLog`, `sp_ClientWorkCanda`, `sp_CommissionMaster`, `sp_CommissionPaymentDetails`, `sp_CommNameMaster`, `sp_Coordinators_EDIT`, `sp_Coordinators_Insert`, `sp_CreateClient`, `sp_DeleteClientDocs`, `sp_DocApproval`, `sp_DocumentMapping`, `sp_DocumentMaster`, `sp_EditClient`, `sp_EditClientContact`, `sp_Enquiry`, `sp_ErrorLog`, `sp_EventDetails`, `sp_EventRegistration`, `sp_EventTickets`, `sp_ExpenseCategories`, `sp_ExpenseNote`, `sp_ExpVisaPointCalculation`, `sp_FamilyInCanada`, `sp_Feedback`, `sp_FeeMaster`, `sp_InitAgreement`, `sp_InstallmentStatus`, `sp_InvoiceDetails`, `sp_Jobseeker`, `sp_MailingList`, `sp_ModuleMaster`, `sp_NewsLetter`, `sp_OAuthClientRegister`, `sp_OnlineAtoms`, `sp_OnlinePayments`, `sp_Opportunities`, `sp_PageAccessControl`, `sp_Payment`, `sp_PaypalPamentAdd`, `sp_PromoCode`, `sp_Receipt`, `sp_Refund`, `sp_RemoveApprovalClientDocs`, `sp_SMTPConfig`, `sp_SourceMaster`, `sp_Tasks`, `sp_TaxCategory`, `sp_tbl_UserDetails`, `sp_UserLog`.

## Email, SMS, and Communication

Email is present and should be migrated carefully.

Evidence:
- `G:\jun\XCRM\XIPHIAS.Services\Email\Messenger.cs` uses `MailMessage` and `SmtpClient`.
- `tbl_SMTPConfig`, `tbl_DefaultMailer`, `tbl_EmailLog`, `tbl_EmailTemplates`, and post-agreement mail tables exist.
- Controllers include `BulkMailController`, `SimpleMailController`, `EmailAPIController`, `EmailSyncController`, `AssessmentMailServiceController`, `PostAgreementEmailsController`, and `SendEmailController`.

SMS is present and should be abstracted behind a provider interface.

Evidence:
- `G:\jun\XCRM\XIPHIAS.Services\SMS\SMSSender.cs`.
- `tbl_SMSConfig`.
- SMS is used for verification, invoice/receipt, reference, and login-created notifications.

Migration rule:
- Do not copy SMTP/SMS credentials into source code.
- Move all live credentials to deployment environment variables or encrypted secret storage.
- Preserve templates and logs as database records.
- Use the existing Next.js `nodemailer` dependency for the website-side implementation.

## How This Links To Xiphias Hub

The current Xiphias Hub already has a client-centered model:

- `PlatformUser`
- `ClientProfile`
- `PlatformLead`
- `MigrationCase`
- `ClientDocument`
- `CaseMilestone`
- `ConversationMessage`
- `RiskProfile`

Legacy CRM mapping target:

| Current Hub concept | Legacy CRM source tables |
| --- | --- |
| User/login | `tbl_UserDetails`, `tbl_ClientUser`, ASP.NET Identity tables |
| Lead | `tbl_Enquiry`, `tbl_LeadDetails`, `tbl_Opportunities`, `tbl_SourceMaster` |
| Client profile | `tbl_Client`, `tbl_ClientContact`, `tbl_ClientFamily`, `tbl_ClientEducation`, `tbl_ClientLanguage`, `tbl_ClientOccupation`, `tbl_ClientBusiness` |
| Case/application | `tbl_ClientApplications`, `tbl_CaseStatus`, `tbl_ClientProcessingDocs`, `tbl_InitAgreement`, `tbl_ClientCoordinators` |
| Documents | `tbl_ClientDocuments`, `tbl_ClientDocsApproval`, `tbl_DocumentMaster`, `tbl_DocumentMapping`, `tbl_DocType`, `tbl_Files` |
| Milestones/status | `tbl_CaseStatus`, `tbl_ClientStatusMaster`, `tbl_TaskLog`, `tbl_Tasks`, `tbl_Notes` |
| Emails/messages | `tbl_EmailLog`, `tbl_MailBox`, `tbl_MailBox_Detail`, `tbl_PostAgreementMailLogs`, `tbl_EmailTemplates` |
| Agreements | `tbl_AgreementTemplate`, `tbl_AgreementUpload`, `tbl_ClientAgreements`, `tbl_InitAgreement` |
| Finance history | `tbl_InvoiceDetails`, `tbl_Receipt`, `tbl_Refund`, `tbl_OnlinePayments`, `tbl_PayuResponse` |
| Reports | CRM views plus `tbl_TaskLog`, `tbl_Opportunities`, accounts tables, assessment tables |

## Recommended Conversion Strategy

### Phase 1 - Schema and data access

1. Get either live SQL Server read access or a `.bak`/`.bacpac` export.
2. Introspect actual tables, views, indexes, foreign keys, and stored procedures.
3. Create a Prisma schema for the modern Postgres target.
4. Keep a migration compatibility layer for stored procedure behavior.
5. Add seed/import scripts for master data and demo-safe data.

### Phase 2 - CRM shell in Next.js

Build a protected `/crm` or `/x-hub/staff` workspace using the existing Next.js app:

- Staff/admin login.
- Role-based navigation.
- Dashboard shell.
- Shared table, filters, export, and detail page patterns.
- Audit logging.

### Phase 3 - Port high-value modules first

Priority order:

1. Opportunity: leads, enquiries, appointments, opportunity tasks, lead import.
2. Clients: client profile, document checklist, uploads, case status, notes.
3. Assessment: assessment forms, express assessment, points, advisor review.
4. Communication: templates, SMTP sending, email logs, post-agreement emails.
5. System masters: branches, countries, programs, fees, document masters, SMTP/SMS config.
6. Accounts: invoice/receipt/refund history and reports. Keep active payment collection with Topmate unless explicitly changed.
7. Reporting: task, coordinator, assessment, accounts summaries.
8. Background jobs: scheduled emails, reminders, pending docs, unpaid clients.

### Phase 4 - Replace legacy integrations

- WCF services become Next.js route handlers or Node service functions.
- MVC controllers become server actions/API routes plus React pages.
- Rotativa PDF generation becomes the existing PDF pipeline or a Node PDF renderer.
- `SmtpClient` becomes `nodemailer`.
- SMS provider becomes an interface, with the current provider adapter kept behind env vars.
- LiveChat becomes a website/XIA/WhatsApp/CRM conversation inbox bridge.

## What Cannot Be Completed Without More Access

The full production conversion needs one of these:

- SQL Server backup/export.
- Read-only live SQL Server credentials.
- Generated schema script from SQL Server Management Studio.
- Stored procedure definitions.

Without that, we can still build the Next.js CRM screens and domain model, but exact data migration and exact procedure behavior will be incomplete.

## Immediate Next Build Step

Create the first modern CRM module inside the existing Next.js app:

1. Add a `/crm` staff/admin route group.
2. Add a CRM dashboard with module cards matching the legacy areas.
3. Add a Prisma-ready CRM domain model draft.
4. Port Opportunity leads first and link website leads to CRM leads.
5. Port Client Profile next and link it to Xiphias Hub.

This lets the website, Xiphias Hub, and future CRM share one client profile instead of creating duplicate client records.
