# PizzaHub — Full-Stack Pizza Delivery Platform

**Version 1.0** · React + Node.js + MongoDB

PizzaHub is a production-ready pizza ordering platform with custom pizza builder, admin operations, Razorpay payments, loyalty rewards, coupons, reviews, real-time order tracking, and a full admin control center.

---

## Features

### Customer
- Register / login with email verification
- Browse menu, pizza details, favorites
- Custom pizza builder and cart
- Checkout (cash + Razorpay online)
- Coupons and reward points redemption
- Order tracking with Socket.IO updates
- Reviews and loyalty tiers
- Dark / light theme (PWA-ready)

### Admin
- Dashboard and marketing analytics
- Pizza CRUD with Cloudinary images
- Inventory and low-stock awareness
- Order center and delivery assignments
- Customer management
- Coupons, banners, reviews moderation
- Audit logs, settings, system health & monitoring

---

## Screenshots

> Add screenshots to `docs/screenshots/` and reference them here for portfolio use.

| Screen | Path |
|--------|------|
| User dashboard | `docs/screenshots/dashboard.png` |
| Checkout | `docs/screenshots/checkout.png` |
| Admin dashboard | `docs/screenshots/admin-dashboard.png` |

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 18, Vite 7, Redux Toolkit, React Router, Tailwind CSS, Socket.IO Client, PWA |
| Backend | Node.js 20, Express, Mongoose, Socket.IO, Winston |
| Database | MongoDB Atlas |
| Payments | Razorpay |
| Media | Cloudinary |
| Email | Nodemailer (SMTP) |
| Testing | Jest, Supertest, React Testing Library |
| CI | GitHub Actions |

---

## Folder Structure

```
pizza-delivery/
├── frontend/          # React SPA (Vite)
│   └── src/
│       ├── api/       # Axios API clients
│       ├── components/
│       ├── pages/
│       ├── redux/
│       └── utils/
├── backend/           # Express API + Socket.IO
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── tests/
├── .github/workflows/ # CI pipeline
├── DEPLOYMENT_GUIDE.md
├── PRODUCTION_CHECKLIST.md
└── API_REFERENCE.md
```

---

## Installation

### Prerequisites
- Node.js 20.x
- MongoDB (local or Atlas)

### Setup

```bash
git clone <repository-url>
cd pizza-delivery
npm install

# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

cd backend && npm run seed   # optional: sample data
cd backend && npm run dev    # http://localhost:5000

# Frontend (new terminal)
cd frontend && npm run dev   # http://localhost:5173
```

### Run tests

```bash
npm run test
npm run build:frontend
```

---

## Environment Variables

See `backend/.env.example` and `DEPLOYMENT_GUIDE.md` for full lists.

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB connection |
| `JWT_SECRET` | Auth tokens |
| `CLIENT_URL` | Frontend origin (CORS + emails) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payments |
| `CLOUDINARY_*` | Image uploads |
| `SMTP_*` | Transactional email |

---

## Deployment

1. **MongoDB Atlas** — cluster + connection string  
2. **Render** — backend Web Service (`backend/`)  
3. **Vercel** — frontend (`frontend/`)  
4. Set env vars and verify `PRODUCTION_CHECKLIST.md`

Detailed steps: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## API Summary

Base URL: `http://localhost:5000/api` (development)

| Group | Prefix |
|-------|--------|
| Auth | `/auth` |
| Pizzas | `/pizza` |
| Orders | `/orders` |
| Coupons | `/coupons` |
| Rewards | `/rewards` |
| Reviews | `/reviews` |
| Admin | `/admin` |
| Health | `/health` |

Full reference: [API_REFERENCE.md](./API_REFERENCE.md)

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design & flows |
| [API_REFERENCE.md](./API_REFERENCE.md) | REST endpoints |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Production deploy |
| [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) | Pre-launch QA |
| [RELEASE_NOTES_v1.0.md](./RELEASE_NOTES_v1.0.md) | v1.0 changelog |
| [LAUNCH_AUDIT_REPORT.md](./LAUNCH_AUDIT_REPORT.md) | Phase 9 audit |

---

## License

Private / portfolio project — adjust license as needed.
