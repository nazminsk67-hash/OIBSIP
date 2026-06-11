# 🍕 Pizza Delivery – Backend

Node.js · Express · MongoDB · Socket.IO · Razorpay

---

## Project Structure

```
backend/
├── server.js                  # Entry point – Express + Socket.IO
├── package.json
├── .env.example               # Copy to .env and fill in values
│
├── config/
│   └── db.js                  # Mongoose connection
│
├── models/
│   ├── User.js                # Users (role: user | admin)
│   ├── Ingredient.js          # Inventory (base, sauce, cheese, veggie, meat)
│   ├── Pizza.js               # Pre-built pizza varieties
│   └── Order.js               # Orders with status tracking
│
├── middleware/
│   ├── auth.js                # JWT protect + adminOnly + socket auth
│   └── errorHandler.js        # Global error handler
│
├── routes/
│   ├── auth.js                # /api/auth/*
│   ├── pizza.js               # /api/pizza/*
│   └── orders.js              # /api/orders/*
│
├── controllers/
│   ├── authController.js
│   ├── pizzaController.js
│   └── orderController.js
│
└── utils/
    ├── email.js               # Nodemailer helpers
    ├── socket.js              # Socket.IO init + emit helpers
    ├── token.js               # JWT sign + createSendToken
    └── seed.js                # DB seeder (run once)
```

---

## Quick Start

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values (MongoDB URI, SMTP, Razorpay keys, etc.)
```

### 3. Seed the database
```bash
npm run seed
# Creates admin@pizza.com / Admin@1234 + sample ingredients + pizza varieties
```

### 4. Start the server
```bash
npm run dev       # development (nodemon)
npm start         # production
```

Server runs on **http://localhost:5000**

---

## API Reference

### Auth  `/api/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Register new user |
| POST | `/login` | — | User login |
| POST | `/admin/login` | — | Admin login |
| GET | `/verify-email/:token` | — | Verify email address |
| POST | `/forgot-password` | — | Send password reset email |
| POST | `/reset-password/:token` | — | Reset password |
| GET | `/me` | 🔒 User | Get current user |

### Pizza  `/api/pizza`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | All pizza varieties (dashboard) |
| GET | `/builder-options` | — | Base, sauce, cheese, veggie, meat lists |
| GET | `/inventory` | 🔒 Admin | Full inventory |
| PATCH | `/inventory/:id` | 🔒 Admin | Update ingredient stock/price |

### Orders  `/api/orders`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/create-payment` | 🔒 User | Create Razorpay order |
| POST | `/place` | 🔒 User | Place order after payment |
| GET | `/my-orders` | 🔒 User | Current user's orders |
| GET | `/:id` | 🔒 User | Single order detail |
| GET | `/` | 🔒 Admin | All orders |
| PATCH | `/:id/status` | 🔒 Admin | Update order status |

### Order Statuses
```
Order Received  →  In the Kitchen  →  Sent to Delivery  →  Delivered
```

---

## Real-time (Socket.IO)

- Frontend connects with `{ auth: { token } }` handshake
- Each user joins room `user:<userId>`
- When admin updates an order status, the backend emits:
  ```json
  { "orderId": "...", "status": "In the Kitchen" }
  ```
  on event **`orderStatusUpdated`** to the order owner's room

---

## Inventory Alerts

After every order placement AND after any manual stock update, if an ingredient's stock falls below its `alertThreshold`, the backend automatically sends an alert email to `ADMIN_EMAIL`.

---

## Razorpay Test Mode

1. Sign up at [razorpay.com](https://razorpay.com) → Dashboard → Settings → API Keys → Generate Test Key
2. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `.env`
3. Add `VITE_RAZORPAY_KEY=rzp_test_...` to the frontend `.env`
4. In test mode, clicking **Success** on the Razorpay modal calls `/api/orders/place` with the payment ID, confirming the order

---

## Email (Development)

Use [Ethereal](https://ethereal.email/) for local testing:
1. Visit https://ethereal.email/ → Create Account
2. Copy SMTP credentials to `.env`
3. Sent emails appear in the Ethereal inbox (not delivered to real addresses)
