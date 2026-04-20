# Deployment And Privacy

## Reviewer Deployment Model

Hosted app shell is public/protected. CSV data is processed locally in the reviewer browser. No CSV is uploaded.

Use a lightweight app-level password gate for early reviewers on Vercel.

## Vercel Environment Variables

Set these for the Vercel project:

```text
VITE_REVIEW_GATE_REQUIRED=true
APP_REVIEW_PASSWORD=<shared reviewer password>
```

`VITE_REVIEW_GATE_REQUIRED` turns the gate on in the browser bundle. `APP_REVIEW_PASSWORD` is checked by the Vercel serverless function at `/api/unlock`.

## Product Privacy Wording

Use this wording in the app and reviewer notes:

> CSV files are processed locally in your browser. No transaction data is uploaded by this app.

## Limits

This is a small reviewer gate, not full user authentication. It is appropriate for private feedback links, not for sensitive production access or broad public release.

