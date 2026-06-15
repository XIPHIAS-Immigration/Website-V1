# Jiopay Hosted Checkout Integration

This project uses Jiopay as a hosted checkout gateway. The site does not collect card data.

## URLs to Give Jiopay

Use these production URLs for configuration:

```txt
Callback URL / S2S
https://www.xiphiasimmigration.com/api/payments/jiopay/webhook

Return URL / B2B browser return
https://www.xiphiasimmigration.com/api/payments/jiopay/return
```

The return endpoint redirects users to:

```txt
https://www.xiphiasimmigration.com/payment/jiopay/return
```

## Environment Variables

Set these in `.env.production` or the server environment. Do not commit the secret key.

```env
NEXT_PUBLIC_SITE_URL=https://www.xiphiasimmigration.com
SITE_URL=https://www.xiphiasimmigration.com

JIOPAY_MODE=uat
JIOPAY_MERCHANT_ID=JP2001100068129
JIOPAY_SECRET_KEY=replace-with-securely-shared-uat-secret
JIOPAY_INITIATE_SALE_URL=https://uat.jiopay.co.in/tsp/pg/api/v2/initiateSale
JIOPAY_STATUS_URL=https://uat.jiopay.co.in/tsp/pg/api/command
JIOPAY_RETURN_URL=https://www.xiphiasimmigration.com/api/payments/jiopay/return
JIOPAY_WEBHOOK_URL=https://www.xiphiasimmigration.com/api/payments/jiopay/webhook
JIOPAY_STORE_PATH=
JIOPAY_DEFAULT_AMOUNT_INR=5000
JIOPAY_AUTO_PROVISION=false
NEXT_PUBLIC_JIOPAY_CHECKOUT_ENABLED=false
```

If `JIOPAY_STORE_PATH` is empty, orders are stored in:

```txt
.xiphias-platform/jiopay-orders.json
```

On the Windows production server, a stable absolute path is better, for example:

```env
JIOPAY_STORE_PATH=I:\wwwroot\website\xiphiasimmigration.com\htmlsite_Immigration\Xiphias_immigration_website\.xiphias-platform\jiopay-orders.json
```

## Flow

1. Public UI or Postman calls `POST /api/payments/jiopay/create-checkout`.
2. The API creates a pending X-Hub lead and local Jiopay order record.
3. The API calls Jiopay `initiateSale`.
4. User is redirected to the returned checkout URL.
5. Jiopay sends the user back to `/api/payments/jiopay/return`.
6. Jiopay sends S2S payment status to `/api/payments/jiopay/webhook`.
7. Webhook verifies `secureHash` and marks the lead/order paid or failed.

## Test Payload

Use this from Postman after env is configured:

```json
{
  "name": "Test Client",
  "email": "test@example.com",
  "phone": "+919999999999",
  "amountInr": 5000,
  "productType": "premium_report",
  "productName": "XIA personalised immigration report",
  "track": "skilled",
  "country": "United States",
  "program": "EB-2 NIW",
  "page": "/xia-intelligence",
  "consent": true,
  "answers": {
    "goal": "High-skill visa assessment",
    "profile": "Software engineer with product leadership experience"
  }
}
```

## Notes

- Browser return is not treated as final proof of payment.
- S2S webhook verification is the payment source of truth.
- Keep `JIOPAY_AUTO_PROVISION=false` during UAT. Turn it on only when report/portal provisioning should happen automatically after verified payment.
- UAT sign-off logs can be collected from X-Hub lead activity and `.xiphias-platform/jiopay-orders.json`.
