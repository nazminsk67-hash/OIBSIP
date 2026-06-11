# API Reference — PizzaHub v1.0

**Base URL:** `{HOST}/api`  
**Auth header:** `Authorization: Bearer <JWT>` (protected routes)

Responses typically: `{ message, ...data }` or array/object payload. Errors: `{ success: false, message }`.

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | `{ status: 'ok', timestamp, uptime }` |
| GET | `/health/metrics` | No | Server uptime, memory, CPU, DB, sessions |

---

## Auth — `/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Register user |
| POST | `/login` | No | User login |
| POST | `/admin/login` | No | Admin login |
| GET | `/verify-email/:token` | No | Verify email |
| POST | `/forgot-password` | No | Request reset email |
| POST | `/reset-password/:token` | No | Reset password |
| GET | `/me` | Yes | Current user profile |
| PATCH | `/me` | Yes | Update profile |
| POST | `/me/password` | Yes | Change password |
| GET | `/favorites` | Yes | List favorite pizzas |
| POST | `/favorites/:pizzaId` | Yes | Add favorite |
| DELETE | `/favorites/:pizzaId` | Yes | Remove favorite |

---

## Pizza — `/pizza`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | Public pizza list |
| GET | `/builder-options` | No | Builder ingredients |
| GET | `/category/:category` | No | Filter by category |
| GET | `/:id` | No | Single pizza |
| GET | `/admin/all` | Admin | All pizzas (admin) |
| GET | `/inventory` | Admin | Ingredient inventory |
| PATCH | `/inventory/:id` | Admin | Update stock |
| POST | `/admin` | Admin | Create pizza |
| PUT | `/admin/:id` | Admin | Update pizza |
| DELETE | `/admin/:id` | Admin | Delete pizza |

---

## Orders — `/orders`

All routes require authentication.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/create-payment` | User | Create Razorpay order |
| POST | `/place` | User | Place order |
| GET | `/my-orders` | User | User order history |
| GET | `/:id` | User | Order detail |
| GET | `/admin/all` | Admin | All orders |
| PUT/PATCH | `/admin/:id/status` | Admin | Update order status |
| GET | `/` | Admin | List orders (admin) |

---

## Coupons — `/coupons`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/validate` | User | Validate code at checkout |
| GET | `/active` | User | Active coupons for user |
| GET | `/` | Admin | List all coupons |
| POST | `/` | Admin | Create coupon |
| GET | `/:id` | Admin | Coupon detail |
| PUT | `/:id` | Admin | Update coupon |
| DELETE | `/:id` | Admin | Delete coupon |
| PATCH | `/:id/activate` | Admin | Toggle active |
| GET | `/:id/usage` | Admin | Usage stats |

---

## Rewards — `/rewards`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | User | Reward summary / points |
| GET | `/history` | User | Points transaction history |

---

## Reviews — `/reviews`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/pizza/:pizzaId` | No | Public reviews for pizza |
| GET | `/me` | User | Current user's reviews |
| POST | `/` | User | Create review |
| PUT | `/:id` | User | Update own review |
| DELETE | `/:id` | User | Delete own review |
| GET | `/admin/all` | Admin | All reviews |
| PATCH | `/admin/:id/hide` | Admin | Hide review |
| PATCH | `/admin/:id/restore` | Admin | Restore review |
| PATCH | `/admin/:id/featured` | Admin | Toggle featured |

---

## Banners — `/banners`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/active` | No | Active homepage banners |
| POST | `/click/:bannerId` | User | Track click |
| GET | `/admin/stats` | Admin | Banner analytics |
| GET | `/` | Admin | All banners |
| POST | `/` | Admin | Create banner |
| PUT | `/:id` | Admin | Update banner |
| DELETE | `/:id` | Admin | Delete banner |

---

## Admin — `/admin`

All routes require admin JWT.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/search?q=` | Global search |
| GET | `/customers` | Customer list + stats |
| GET | `/health` | Business + system health metrics |
| GET | `/settings` | Store settings |
| PUT | `/settings` | Update settings |
| GET | `/audit-logs` | Audit log entries |
| GET | `/marketing-analytics` | Marketing stats |
| GET/POST/PUT/DELETE | `/inventory` | Inventory CRUD |
| GET/POST/PATCH | `/delivery/assignments` | Delivery management |

---

## Users — `/users`

Mirror of profile/favorites endpoints (legacy/alternate paths) — prefer `/auth/me` where available.

---

## Socket.IO Events

Connect with JWT (same as HTTP). Server emits order status updates to user/admin rooms. See `backend/utils/socket.js`.

---

## Rate Limits

- `/api/auth/*` — 20 requests / 15 min  
- `/api/*` — 100 requests / 15 min  

---

For deployment env vars see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
