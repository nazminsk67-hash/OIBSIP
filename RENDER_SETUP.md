# Render Deployment Setup Guide

## Overview
This guide helps you deploy the Pizza Delivery backend on Render.

## Prerequisites
- A Render account (https://render.com)
- MongoDB Atlas account for database (or local MongoDB)
- Razorpay account for payment processing

## Environment Variables to Set on Render

Set these in your Render service's **Environment** section:

```
# Server
NODE_ENV=production
PORT=5000

# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Email (SMTP)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_user@ethereal.email
SMTP_PASS=your_ethereal_password
EMAIL_FROM=noreply@pizzadelivery.com

# Client URL (frontend domain)
CLIENT_URL=https://your-frontend-domain.com

# Admin Email
ADMIN_EMAIL=admin@pizzadelivery.com

# Razorpay Payment Gateway (REQUIRED)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Stock Alert Threshold
STOCK_ALERT_THRESHOLD=20
```

## Deployment Steps

### 1. Connect Your GitHub Repository
- Go to Render Dashboard → New → Web Service
- Connect your GitHub repository (`https://github.com/nazminsk67-hash/OIBSIP`)
- Select **Node** as the runtime

### 2. Configure Build & Deploy Settings
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: Leave as default or specify `>=18`
- **Root Directory**: Leave empty (Render will auto-detect)

### 3. Add Environment Variables
- In Render dashboard, go to your service → **Environment**
- Add all the environment variables listed above
- **IMPORTANT**: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are required for payment processing

### 4. Deploy
- Click **Create Web Service**
- Render will automatically:
  1. Clone your repo
  2. Run `npm install` (installs backend & frontend dependencies via workspaces)
  3. Run `npm start` (starts the backend server)

## Troubleshooting

### Build Fails with "no such file or directory, open package.json"
- ✅ **Fixed**: Root-level `package.json` with npm workspaces declares `backend` and `frontend` as workspace packages

### Startup Fails with "Razorpay key_id is mandatory"
- ✅ **Fixed**: Razorpay now uses lazy initialization—only initializes when payment endpoint is called
- **Action**: Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Render environment variables

### MongoDB Connection Fails
- Ensure your `MONGO_URI` is correct
- If using MongoDB Atlas, add Render's IP to your IP whitelist (or allow 0.0.0.0/0)

### Frontend Can't Connect to Backend
- Update `CLIENT_URL` to match your Render service URL
- Ensure CORS is enabled on the backend (it is by default)

## Verifying Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-render-service-url.onrender.com/api/health

# Should return:
# {"status":"ok"}
```

## Notes
- Free Tier instances spin down after 15 minutes of inactivity
- For production, use Render's **Paid** tier for always-on services
- MongoDB Atlas has a free tier, but Razorpay requires live credentials
