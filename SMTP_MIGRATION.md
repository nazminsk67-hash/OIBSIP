# SMTP Migration — Mailtrap Sandbox → Production

## Problem

`sandbox.smtp.mailtrap.io` captures emails inside Mailtrap only. They **never** reach Gmail, Outlook, or Yahoo.

## Solution

Update `backend/.env` with a **production** SMTP provider (examples in `.env.example`).

### Gmail (recommended for testing)

1. Enable 2FA on your Google account.
2. Create an [App Password](https://myaccount.google.com/apppasswords).
3. Set in `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM="PizzaHub <your.email@gmail.com>"
```

### Mailtrap Email Sending (production, not Sandbox)

Use credentials from **Email Sending → SMTP** in Mailtrap (host is `live.smtp.mailtrap.io`, NOT `sandbox.smtp.mailtrap.io`).

## Verify connection

```bash
cd backend
node scripts/verify-smtp.js
```

On server start you should see:

```
SMTP Connected Successfully
```

If you still use sandbox:

```
SMTP Connection Failed
Mailtrap SANDBOX detected ...
```

## Restart backend

```bash
npm run dev
```

Look for `Email Sent` in console when registering or resetting password.
