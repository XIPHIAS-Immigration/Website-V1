# Client Referral Flow – XIPHIAS Immigration

This document explains how the **Client Referral** feature works in the website
and how backend / CRM integrations can be added.

---

## 1. User flow

1. User visits **`/client-referrals`**.
2. They see:
   - Hero section explaining the referral program.
   - Left column: "How the referral program works".
   - Right column: the **ReferralForm**.
3. User fills in:
   - Their own details (referrer).
   - Friend / family member details (referred person).
   - Optional notes and consent checkbox.
4. On **Submit**:
   - Frontend sends a `POST` request to `POST /api/referral` with JSON body.
   - Server validates required fields.
   - SMTP emails are sent:
     - One to the **referrer** (thank-you + summary).
     - One to **admin** (full details).
   - JSON `{ ok: true, message: "Referral submitted successfully" }` is
     returned to the browser.
   - Frontend shows a success toast and (optionally) redirects to
     `/client-referrals/thank-you`.

---

## 2. Frontend components

### `/client-referrals/page.tsx`

- Hero + explainer + `<ReferralForm />`.
- Uses Tailwind and existing gradient hero style used across the site.

### `ReferralForm` component

Location: `src/components/ReferralForm/index.tsx`

- `"use client"` React component.
- Fields:

  - `referrerName` (string, required)
  - `referrerEmail` (string, required, email)
  - `referrerPhone` (string, optional)
  - `referrerClientId` (string, optional)
  - `friendName` (string, required)
  - `friendEmail` (string, required, email)
  - `friendPhone` (string, optional)
  - `friendCountry` (string, optional)
  - `notes` (string, optional)
  - `consent` (checkbox, `yes` when checked)

- Validation:
  - Names: at least 2 characters.
  - Email: basic `something@domain.tld` validation.
  - Phone: digits / + / - / () / spaces with min length 7 if provided.
  - Notes: at least 10 characters if provided.

- On submit:
  - Sends `POST /api/referral` with JSON body.
  - Shows success or error toast based on API response.
  - Can optionally redirect to `/client-referrals/thank-you` via
    `onSuccessRedirect` prop.

---

## 3. API endpoint

### URL

`POST /api/referral`

### Handler

File: `src/app/api/referral/route.ts`

### Request body

The frontend sends a JSON object like:

```json
{
  "referrerName": "Jane Doe",
  "referrerEmail": "jane@example.com",
  "referrerPhone": "+91 99860 72700",
  "referrerClientId": "XIP-2024-12345",
  "friendName": "John Smith",
  "friendEmail": "john@example.com",
  "friendPhone": "+971 5x xxx xxxx",
  "friendCountry": "Canada",
  "notes": "He is looking for PR options in the next 6–12 months.",
  "consent": "yes",
  "page": "/client-referrals",
  "referrerUrl": "https://www.xiphiasimmigration.com/previous-page"
}




---

## Ready-made JSON spec file


```json
{
  "name": "Client Referral API",
  "endpoint": "/api/referral",
  "method": "POST",
  "description": "Creates a new client referral from the public website.",
  "request": {
    "contentType": "application/json",
    "fields": {
      "referrerName": {
        "type": "string",
        "required": true,
        "description": "Full name of the person making the referral."
      },
      "referrerEmail": {
        "type": "string",
        "required": true,
        "description": "Email address of the referrer."
      },
      "referrerPhone": {
        "type": "string",
        "required": false,
        "description": "Phone number of the referrer."
      },
      "referrerClientId": {
        "type": "string",
        "required": false,
        "description": "Internal client ID / case number if the referrer is an existing client."
      },
      "friendName": {
        "type": "string",
        "required": true,
        "description": "Full name of the referred person."
      },
      "friendEmail": {
        "type": "string",
        "required": true,
        "description": "Email address of the referred person."
      },
      "friendPhone": {
        "type": "string",
        "required": false,
        "description": "Phone number of the referred person."
      },
      "friendCountry": {
        "type": "string",
        "required": false,
        "description": "Country the referred person is interested in (e.g. Canada, Australia)."
      },
      "notes": {
        "type": "string",
        "required": false,
        "description": "Free-text notes about the referral (timeline, goals, etc.)."
      },
      "consent": {
        "type": "string",
        "required": false,
        "description": "When present and equal to 'yes', indicates the referrer confirmed consent to share details."
      },
      "page": {
        "type": "string",
        "required": false,
        "description": "Path of the page from which the referral was submitted, e.g. '/client-referrals'."
      },
      "referrerUrl": {
        "type": "string",
        "required": false,
        "description": "Browser referrer URL (previous page)."
      }
    }
  },
  "responses": {
    "200": {
      "description": "Referral created successfully.",
      "body": {
        "ok": true,
        "message": "Referral submitted successfully"
      }
    },
    "400": {
      "description": "Validation error (missing or invalid fields).",
      "body": {
        "error": "Missing required fields."
      }
    },
    "500": {
      "description": "Unexpected server / SMTP / CRM error.",
      "body": {
        "error": "Detailed error message for logs / debugging."
      }
    }
  },
  "notes": [
    "Backend can integrate with CRM inside the /api/referral route before or after sending emails.",
    "Frontend expects JSON responses in the format described above and will show toast messages accordingly."
  ]
}