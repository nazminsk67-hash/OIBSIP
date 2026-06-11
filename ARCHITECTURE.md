# PizzaHub — System Architecture (v1.0)

## Overview

PizzaHub is a monorepo with a React SPA frontend and a Node/Express REST API. Real-time features use Socket.IO. Persistence is MongoDB via Mongoose. Payments use Razorpay; images use Cloudinary.

```
┌─────────────┐     HTTPS/WS      ┌──────────────┐     Mongoose    ┌─────────────┐
│   React     │ ◄──────────────► │   Express    │ ◄─────────────► │  MongoDB    │
│   (Vite)    │    /api + socket │   + Socket   │                 │   Atlas     │
└─────────────┘                   └──────────────┘                 └─────────────┘
       │                                  │
       │                                  ├── Razorpay API
       │                                  ├── Cloudinary API
       └──────── Redux (client state)     └── SMTP (Nodemailer)
```

---

## Frontend Architecture

| Concern | Implementation |
|---------|----------------|
| Routing | React Router v6, lazy-loaded route chunks |
| State | Redux Toolkit (`auth`, `cart`, `order`, `pizza`, `favorites`, `notifications`) |
| API | Axios instance with JWT interceptor (`api/axiosConfig.js`) |
| Real-time | `useSocket` hook → order status events |
| Theming | CSS variables + `ThemeContext` (light/dark) |
| UI | Tailwind + shared classes (`btn-primary`, `card`, `page-shell`) |
| SEO | `SEO.jsx` — document title & meta tags per route |
| Errors | `ErrorBoundary` + `errorLogger.js` |

### Key user flows (UI only)
- **Dashboard** → `PizzaList` (menu homepage)
- **Builder** → ingredient steps → cart
- **Checkout** → coupons/rewards → Razorpay or cash → order placed

### Admin shell
- `AdminLayout` + sidebar navigation
- Role guard: `ProtectedRoute adminOnly`

---

## Backend Architecture

| Layer | Responsibility |
|-------|----------------|
| `server.js` | Boot: DB connect, env validation, Socket.IO, HTTP listen |
| `createApp.js` | Express app factory (middleware + routes + health) |
| `routes/` | Route definitions only |
| `controllers/` | Request handlers |
| `models/` | Mongoose schemas |
| `middleware/` | `auth`, `errorHandler`, `requestLogger` |
| `utils/` | JWT, email, socket, Winston logger |

### Security middleware (order)
1. Helmet  
2. `mongo-sanitize`, `xss-clean`  
3. Request logger  
4. CORS allowlist  
5. Rate limits (auth + API)  
6. Body parser (10kb limit)  
7. Routes  
8. `notFound` → `errorHandler`  

---

## Database Architecture

Core collections (Mongoose models):

| Model | Purpose |
|-------|---------|
| User | Auth, roles (`user` \| `admin`), favorites, addresses |
| Pizza | Menu items, sizes, toppings, images |
| Order | Line items, status, payment, totals |
| Ingredient / Inventory | Stock for builder & admin |
| Coupon | Discount rules, usage limits |
| Review | Pizza ratings, moderation flags |
| RewardTransaction | Points earn/redeem history |
| Banner | Marketing homepage banners |
| Settings | Store configuration |
| AuditLog | Admin action trail |
| DeliveryAssignment | Delivery workflow |

Relationships use MongoDB `ObjectId` references (`ref`) with `.populate()` where needed.

---

## Authentication Flow

1. User registers → password hashed (bcrypt) → verification token emailed  
2. User verifies email → can log in via `POST /api/auth/login`  
3. Server returns JWT → stored in `localStorage` + Redux  
4. Axios attaches `Authorization: Bearer <token>`  
5. `protect` middleware decodes JWT → `req.user`  
6. Admin uses separate `POST /api/auth/admin/login`  
7. Token expiry returns `401` → client redirects to login  

---

## Payment Flow (Razorpay)

1. User submits checkout → `POST /api/orders/create-payment`  
2. Server creates Razorpay order, returns order id + key  
3. Client opens Razorpay checkout widget  
4. On success → `POST /api/orders/place` with payment proof  
5. Server verifies signature, persists order, emits Socket event  
6. Cash path skips Razorpay and places order directly  

---

## Order Flow

```
Cart (Redux) → Checkout → placeOrder API → Order document
                              ↓
                    Socket.IO: status updates
                              ↓
              User OrderStatus / Admin Order Center
```

Statuses progress through kitchen → delivery → delivered (admin updates).

---

## Admin Workflow

1. Admin logs in → JWT with `role: admin`  
2. Dashboard loads aggregated orders/pizzas  
3. Operations: pizzas, inventory, orders, delivery, customers  
4. Marketing: coupons, banners, analytics  
5. Moderation: reviews hide/restore/feature  
6. Observability: audit logs, system health, monitoring metrics  

---

## Deployment Topology

| Service | Host | Notes |
|---------|------|-------|
| Frontend | Vercel | Static `dist/`, env for API URL |
| Backend | Render | Web Service, WebSocket support |
| Database | MongoDB Atlas | Managed cluster |
| Media | Cloudinary | CDN URLs in pizza/banner docs |

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
