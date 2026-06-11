# Pizza Delivery — Deployment Guide

Production deployment for the PizzaHub full-stack application (React + Vite frontend, Node/Express backend, MongoDB Atlas).

---

## Prerequisites

- Node.js 20.x
- MongoDB Atlas cluster
- Razorpay account (test/live keys)
- Cloudinary account
- SMTP provider (SendGrid, Gmail, Ethereal for dev)
- Render account (backend) and Vercel account (frontend)

---

## 1. MongoDB Atlas

1. Create a free cluster at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write access.
3. Network Access: allow `0.0.0.0/0` for cloud hosts (or restrict to Render IPs).
4. Copy the connection string:

```text
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/pizza-delivery?retryWrites=true&w=majority
```

5. Run the seed script once from your machine (optional):

```bash
cd backend && npm run seed
```

---

## 2. Backend — Render

1. Connect your GitHub repository to Render.
2. Create a **Web Service**:
   - **Root directory:** `backend` (or repo root with start command `node backend/server.js`)
   - **Build command:** `npm install`
   - **Start command:** `npm start` or `node server.js`
   - **Node version:** 20

### Environment variables (Render)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` (Render sets `PORT` automatically) |
| `MONGO_URI` | Atlas connection string |
| `JWT_SECRET` | Long random secret |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `CLIENT_URLS` | Comma-separated extra origins if needed |
| `RAZORPAY_KEY_ID` | Razorpay key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_HOST` | SMTP host |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `EMAIL_FROM` | Sender address |
| `ADMIN_EMAIL` | Low-stock alert recipient |

3. Deploy and verify:

```bash
curl https://your-api.onrender.com/api/health
```

---

## 3. Frontend — Vercel

1. Import the repository in Vercel.
2. Set **Root Directory** to `frontend`.
3. **Build command:** `npm run build`
4. **Output directory:** `dist`

### Environment variables (Vercel)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | `https://your-api.onrender.com/api` (if used in axios config) |

Update `frontend/src/api/axiosConfig.js` base URL for production if not already using env.

5. Add your Vercel URL to backend `CLIENT_URL` and `CLIENT_URLS`.

---

## 4. Razorpay

1. Dashboard → Settings → API Keys.
2. Use test keys in staging; live keys in production.
3. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` on Render.
4. Expose public key to frontend only via checkout flow (server creates orders).

---

## 5. Cloudinary

1. Dashboard → Settings → copy cloud name, API key, API secret.
2. Set on Render backend (image uploads from admin pizza management).

---

## 6. SMTP / Email

Configure Nodemailer variables on the backend. Without SMTP, registration still works but verification emails may be skipped.

Test with Ethereal in development: [https://ethereal.email](https://ethereal.email).

---

## 7. Socket.IO

- Ensure Render Web Service supports WebSockets.
- Frontend socket client must point to the same API host as HTTP.
- CORS `CLIENT_URL` must match the Vercel origin exactly.

---

## 8. Production checklist (pre-launch)

- [ ] All env vars set on Render and Vercel
- [ ] `npm run test` passes locally and in CI
- [ ] `/api/health` returns `{ status: "ok" }`
- [ ] Admin login, user login, place test order
- [ ] Razorpay test payment in staging
- [ ] Cloudinary image upload from admin
- [ ] Email verification / password reset (if SMTP enabled)
- [ ] Review `PRODUCTION_CHECKLIST.md` feature-by-feature

---

## 9. Logs and monitoring

- Backend Winston logs: `backend/logs/` (error, combined, security, admin-activity).
- Admin **Monitoring** dashboard: `/admin/monitoring`
- Public metrics (read-only): `GET /api/health/metrics`

---

## 10. CI/CD

GitHub Actions workflow: `.github/workflows/ci.yml`

Runs on push/PR: install → backend tests → frontend tests → frontend build → backend health smoke check.

---

## Troubleshooting

| Issue | Check |
|-------|--------|
| CORS errors | `CLIENT_URL` matches Vercel URL exactly |
| 401 on API | JWT token, clock skew, `JWT_SECRET` unchanged |
| MongoDB timeout | Atlas IP allowlist, connection string |
| Razorpay fails | Keys, amount in paise, webhook not required for basic flow |
| Socket disconnect | Same origin policy, Render websocket support |
