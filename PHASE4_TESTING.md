# PHASE 4 TESTING GUIDE

## Pre-Testing Checklist
- [ ] Backend is running on port 5000
- [ ] MongoDB is connected
- [ ] Frontend is running on port 5173
- [ ] Redis (if used) is available
- [ ] Socket.IO is properly configured

## Test Scenarios

### 1. USER ORDER PLACEMENT ✅

**Setup**: Login as a regular user

**Steps**:
1. Navigate to `/dashboard`
2. Add a pizza to cart
3. Click "View Cart"
4. Proceed to `/checkout`
5. Fill in delivery details:
   - Address: "123 Main Street, Apartment 4B"
   - Phone: "+91 9876543210"
6. Select payment method: "Cash on Delivery"
7. Click "Place order now"

**Expected Results**:
- ✅ Toast notification: "Order placed successfully!"
- ✅ Redirect to `/my-orders`
- ✅ Cart is cleared
- ✅ Order appears in the list
- ✅ Order has status "Order Received"
- ✅ MongoDB shows new Order document with:
  - userId populated
  - pizzas array filled
  - address, phone, paymentMethod saved
  - totalPrice calculated
  - status = "Order Received"
  - timestamps set

**Verification**:
```bash
# Check MongoDB
db.orders.findOne({}, {sort: {createdAt: -1}})
# Should show complete order data
```

---

### 2. USER ORDER TRACKING PAGE ✅

**Setup**: User has placed at least one order

**Access**: Navigate to `/my-orders`

**Expected UI**:
- ✅ Page title: "Order history"
- ✅ Live updates indicator (green dot with "Live updates active")
- ✅ Order cards showing:
  - Order ID (last 8 chars)
  - Creation timestamp
  - Status badge (color-coded)
  - Total price
- ✅ For each order:
  - Delivery progress timeline with 4 steps
  - Progress bar showing current position
  - Step indicators (numbered, current highlighted, completed with ✓)
  - Delivery address
  - Phone number
  - Order items list with individual prices
  - Payment method (Cash on Delivery)
  - Total amount

**Responsive Testing**:
- [ ] Desktop (1920px): All elements visible, 2-column layout
- [ ] Tablet (768px): Stack layout, single column
- [ ] Mobile (375px): Full responsive, readable on small screen

---

### 3. ADMIN ORDER MANAGEMENT ✅

**Setup**: Login as admin

**Access**: Navigate to `/admin/orders`

**Expected UI**:
- ✅ Page title: "Orders management"
- ✅ Status filter buttons: "All Orders", "Order Received", "In the Kitchen", "Sent to Delivery", "Delivered"
- ✅ Order count badge
- ✅ Order cards with color-coded backgrounds based on status
- ✅ Each order card shows:
  - Order ID
  - Customer name & email
  - Date & time
  - Total price
  - Payment method
  - Delivery address & phone
  - Ordered items with details
  - Current status badge
  - Status update dropdown

**Test Filter Functionality**:
1. Click "Order Received" filter
   - Expected: Only orders with "Order Received" status shown
2. Click "In the Kitchen"
   - Expected: Only kitchen orders shown
3. Click "All Orders"
   - Expected: All orders shown again

**Test Status Update**:
1. Click status dropdown on an order
2. Select "In the Kitchen"
   - Expected: Dropdown shows loading spinner
   - Toast: "Order status updated to In the Kitchen"
   - Order card background changes to blue
   - Count updates
3. Change to "Sent to Delivery"
   - Expected: Background changes to purple
4. Change to "Delivered"
   - Expected: Background changes to emerald green

---

### 4. REAL-TIME ORDER UPDATES ✅

**Setup**: 
- User logged in on browser 1 at `/my-orders`
- Admin logged in on browser 2 at `/admin/orders`
- Socket.IO connection active (check browser console)

**Test Steps**:
1. On browser 2 (admin), change order status to "In the Kitchen"
2. Observe browser 1 (user):
   - Expected: Within 1-2 seconds:
     - Order status updates to "In the Kitchen"
     - Progress bar advances to step 2
     - Status badge changes color to blue
     - Progress step 2 becomes highlighted
     - Toast notification: "Order update: In the Kitchen"

**Real-time Flow**:
1. Admin changes: "In the Kitchen" → "Sent to Delivery"
   - User sees: Progress step 3 highlights, progress bar at 75%
2. Admin changes: "Sent to Delivery" → "Delivered"
   - User sees: All steps show checkmark, progress bar at 100%, "Delivered" status

---

### 5. PAYMENT METHOD SELECTION ✅

**Setup**: On checkout page (`/checkout`)

**Expected UI**:
- Payment method selector with:
  - "Cash on Delivery" - with 💵 icon, enabled
  - "Online Payment" - with 💳 icon, disabled with "Coming soon" badge
  - Info text: "Your order details will be securely stored..."

**Test**:
1. Click "Cash on Delivery"
   - Expected: Selected state (checked circle)
2. Try to click "Online Payment"
   - Expected: Disabled (cannot click)
3. Select "Cash on Delivery" and place order
   - Expected: Order placed successfully with paymentMethod = 'cash'

---

### 6. ERROR HANDLING ✅

**Test Missing Fields**:
1. Try checkout without address
   - Expected: Error: "Please fill in all required fields"
2. Try without phone
   - Expected: Error toast
3. Try with empty cart
   - Expected: Empty state message with CTA to browse pizzas

**Test Loading States**:
1. Place order on slow connection
   - Expected: "Placing order..." text, spinner visible
2. Fast network
   - Expected: Quick completion

**Test Error States** (if backend returns error):
1. Server error on order placement
   - Expected: Error message displayed, toast notification

---

### 7. RESPONSIVE DESIGN TESTING ✅

**Desktop (1920px)**:
- [ ] All content visible without scroll
- [ ] Multi-column layouts working
- [ ] Sidebar sticky on admin

**Tablet (768px)**:
- [ ] Navigation responsive
- [ ] Content stacks properly
- [ ] Touch-friendly button sizes
- [ ] Forms single column

**Mobile (375px)**:
- [ ] Full-width content
- [ ] Readable text (no horizontal scroll)
- [ ] Large touch targets
- [ ] Forms vertical stack
- [ ] Cards full width with padding

---

### 8. EXISTING FEATURES STILL WORKING ✅

**Authentication**:
- [ ] User login still works
- [ ] Admin login still works
- [ ] Logout functionality works
- [ ] Protected routes guard properly
- [ ] JWT tokens still valid

**Pizza Management**:
- [ ] View pizzas on `/dashboard`
- [ ] Add pizzas to cart
- [ ] Edit cart quantities
- [ ] Remove from cart
- [ ] View pizza details
- [ ] Pizza images display

**Cart**:
- [ ] Items persist in Redux
- [ ] Line totals calculate correctly
- [ ] Cart count shows in nav
- [ ] Clear cart button works
- [ ] Cart updates in real-time

---

### 9. DATABASE VERIFICATION ✅

**Check MongoDB Collections**:

```javascript
// 1. Check Order collection
db.orders.find({}).pretty()

// 2. Verify user reference
db.orders.findOne({_id: ObjectId("...")}).populate("user")

// 3. Check order status
db.orders.findOne({status: "Order Received"})

// 4. Verify pizza details
db.orders.findOne({}, {pizzas: 1}).pretty()

// 5. Check timestamps
db.orders.findOne({}, {createdAt: 1, updatedAt: 1})
```

**Expected Results**:
- [ ] All orders have user ObjectId reference
- [ ] All orders have complete pizza details
- [ ] Prices saved correctly
- [ ] Timestamps accurate
- [ ] Status matches enum values

---

### 10. SOCKET.IO VERIFICATION ✅

**Browser Console Checks**:

```javascript
// Open DevTools Console on user page
// You should see:
// "Socket connected: [socket-id]"
// "Socket listening for: orderStatusUpdated"

// Check socket room:
// Should see user joined room: "user:[userId]"
```

**Network Tab**:
- [ ] WebSocket connection established
- [ ] Socket events visible in Network > WS

---

## PERFORMANCE CHECKLIST ✅

- [ ] Page load < 2 seconds
- [ ] Order placement < 3 seconds
- [ ] Real-time updates < 1 second
- [ ] No console errors
- [ ] No memory leaks
- [ ] API responses < 500ms

---

## FINAL VERIFICATION CHECKLIST ✅

### Backend
- [ ] Order model has no duplicate fields
- [ ] All API endpoints return correct data
- [ ] Socket.IO emits to correct rooms
- [ ] Error handling works
- [ ] No CORS issues
- [ ] Environment variables loaded

### Frontend
- [ ] All pages render without errors
- [ ] No broken imports
- [ ] Redux actions dispatch correctly
- [ ] API calls succeed
- [ ] Socket listeners active
- [ ] Toast notifications work

### Deployment
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Vercel deployment successful
- [ ] Backend runs on Render
- [ ] No environment variable errors
- [ ] Database connection stable

---

## SIGN-OFF

When all tests pass, mark here:

- [ ] All test scenarios passed
- [ ] No console errors
- [ ] No console warnings (related to this feature)
- [ ] Responsive design verified
- [ ] Existing features working
- [ ] Database data correct
- [ ] Performance acceptable
- [ ] Ready for production

**Tested by**: _______________  
**Date**: _______________  
**Status**: ✅ READY FOR DEPLOYMENT
