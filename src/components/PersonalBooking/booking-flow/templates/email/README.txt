These are reference HTML templates for the backend's /bookings/:id/confirm workflow.
Backend steps:
1) Build ICS with the confirmed date/time and include as attachment.
2) Send userConfirmationHtml() to the user's email.
3) Send adminNotificationHtml() to internal recipients with all details.
4) (Optional) Create Google/Outlook event and store joinUrl.
