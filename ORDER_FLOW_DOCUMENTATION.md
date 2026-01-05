# 🛒 Complete Order Flow Documentation

## 📊 Visual Flow Diagrams

### 1. Complete Order Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER JOURNEY                                 │
└─────────────────────────────────────────────────────────────────────────┘

    [Customer Browses Products]
              ↓
    [Adds Items to Cart]
              ↓
    [Applies Coupon Code?] ──→ [Verify Coupon] ──→ [Apply Discount]
              ↓                      ↓
              ↓                 [Invalid/Used]
              ↓                      ↓
              ↓                 [Show Error]
              ↓
    [Checkout: Choose Payment]
              ↓
         ┌────┴────┐
         ↓         ↓
    [CASH]    [ONLINE]
         ↓         ↓
         │    [Stripe Checkout]
         │         ↓
         │    [Payment Success]
         │         ↓
         │    [Webhook Triggered]
         │         ↓
         └────┬────┘
              ↓
    [Order Created - Status: PENDING]
              ↓
    [Inventory Decreased]
              ↓
    [WhatsApp Notification Sent]
         ↓         ↓
    [Customer] [Admin]
              ↓
    [Email Confirmation Sent]
              ↓
    [Coupon Marked as Used (if applied)]
              ↓
    [Low Stock Alert? (≤10 items)]
              ↓
    [Admin Reviews Order]
              ↓
    [Status: CONFIRMED]
              ↓
    [Admin Prepares Order]
              ↓
    [Status: READY]
              ↓
    [Generate Delivery Routes]
              ↓
    [Assign to Driver]
              ↓
    [Driver Receives Route]
              ↓
    [Driver Delivers Order]
              ↓
    [Mark as DELIVERED]
              ↓
    [Feedback Email Sent]
              ↓
    [Customer Submits Feedback]
              ↓
    [£2 Coupon Generated]
              ↓
    [Coupon Email Sent]
              ↓
    [Order Complete ✓]
```

---

## 🔄 Detailed Flow Breakdown

### Phase 1: Order Creation

```
┌──────────────────────────────────────────────────────────────┐
│                    ORDER CREATION FLOW                        │
└──────────────────────────────────────────────────────────────┘

1. Customer adds products to cart
   └─→ Frontend stores cart in state

2. Customer proceeds to checkout
   └─→ Enters: Name, Email, Phone, Address
   └─→ Selects: Delivery or Collection
   └─→ Selects: Payment Method (CASH/ONLINE)

3. Coupon Application (Optional)
   ├─→ Customer enters coupon code
   ├─→ API: POST /api/payment/verify-coupon
   ├─→ Check: Code exists?
   ├─→ Check: Not used?
   ├─→ Check: Not expired?
   ├─→ If valid: Apply discount
   └─→ If invalid: Show error message

4A. CASH Payment Flow
   ├─→ API: POST /api/orders
   ├─→ Create order (status: pending)
   ├─→ Create order_items
   ├─→ Decrease inventory
   ├─→ Send WhatsApp notifications
   └─→ Send email confirmation

4B. ONLINE Payment Flow
   ├─→ API: POST /api/payment/create-checkout-session
   ├─→ Create Stripe session with metadata:
   │   ├─→ Customer info
   │   ├─→ Cart data
   │   └─→ Coupon code
   ├─→ Redirect to Stripe
   ├─→ Customer pays
   ├─→ Stripe webhook: POST /api/payment/webhook
   ├─→ Create order (status: pending)
   ├─→ Create order_items
   ├─→ Mark coupon as used
   ├─→ Decrease inventory
   ├─→ Check low stock (≤10)
   ├─→ Send WhatsApp to admin
   └─→ Send email confirmation
```

---

### Phase 2: Order Processing

```
┌──────────────────────────────────────────────────────────────┐
│                   ORDER PROCESSING FLOW                       │
└──────────────────────────────────────────────────────────────┘

1. Admin Views Orders
   └─→ API: GET /api/orders
   └─→ Shows all orders with status

2. Admin Confirms Order
   ├─→ API: PUT /api/orders/:id/status
   ├─→ Body: { status: "confirmed" }
   └─→ Order status: PENDING → CONFIRMED

3. Admin Prepares Order
   ├─→ Packs items
   ├─→ API: PUT /api/orders/:id/status
   ├─→ Body: { status: "ready" }
   └─→ Order status: CONFIRMED → READY

4. Order Cancellation (if needed)
   ├─→ API: POST /api/orders/:id/cancel
   ├─→ If ONLINE payment:
   │   ├─→ Retrieve Stripe session
   │   ├─→ Create refund
   │   └─→ Process refund
   ├─→ Restore inventory
   ├─→ Update status: CANCELLED
   └─→ Send cancellation email
```

---

### Phase 3: Delivery Management

```
┌──────────────────────────────────────────────────────────────┐
│                   DELIVERY FLOW                               │
└──────────────────────────────────────────────────────────────┘

1. Generate Delivery Routes
   ├─→ API: POST /api/delivery/generate-routes-from-orders
   ├─→ Input: Selected orders + number of drivers
   ├─→ Process:
   │   ├─→ Geocode all addresses (OpenRouteService)
   │   ├─→ Split orders among drivers
   │   ├─→ Optimize route for each driver
   │   ├─→ Calculate distance & duration
   │   └─→ Return optimized routes
   └─→ Output: Routes with order sequence

2. Assign Route to Driver
   ├─→ API: POST /api/delivery/assign-route
   ├─→ Input: { driverId, orderIds, routeData }
   ├─→ Create delivery_routes record
   ├─→ Update orders:
   │   ├─→ Set driver_id
   │   └─→ Set route_id
   └─→ Driver receives assignment

3. Driver Views Deliveries
   ├─→ API: GET /api/delivery/driver-deliveries
   ├─→ Header: driver-id
   ├─→ Returns: Orders in optimized sequence
   └─→ Shows: Address, customer, phone

4. Driver Delivers Order
   ├─→ Driver marks order as delivered
   ├─→ API: PUT /api/delivery/mark-delivered/:id
   ├─→ Update status: READY → DELIVERED
   ├─→ Send feedback request email
   └─→ Email contains: Order ID, feedback link

Alternative: Admin marks as delivered
   ├─→ API: PUT /api/orders/:id/status
   ├─→ Body: { status: "delivered" }
   ├─→ Same process as above
   └─→ Feedback email sent
```

---

### Phase 4: Feedback & Rewards

```
┌──────────────────────────────────────────────────────────────┐
│                   FEEDBACK FLOW                               │
└──────────────────────────────────────────────────────────────┘

1. Customer Receives Email
   └─→ Email contains feedback link
   └─→ Link format: /feedback?orderId=123

2. Customer Opens Feedback Form
   ├─→ API: GET /api/feedback/order/:orderId
   ├─→ Validates: Order exists & delivered
   ├─→ Returns: Order details & products
   └─→ Shows feedback form

3. Customer Submits Feedback
   ├─→ API: POST /api/feedback/submit
   ├─→ Input:
   │   ├─→ orderId
   │   ├─→ productRatings: { productId: { rating, comment } }
   │   ├─→ deliveryRating (1-5)
   │   ├─→ driverRating (1-5)
   │   └─→ deliveryComments
   ├─→ Check: Feedback already submitted?
   │   └─→ If yes: Show "already submitted" message
   ├─→ Save feedback to database
   ├─→ Generate unique coupon code (FFH + random)
   ├─→ Create coupon:
   │   ├─→ Code: FFH12345678
   │   ├─→ Amount: £2.00
   │   ├─→ Expires: 6 months from now
   │   └─→ Used: false
   ├─→ Mark order: feedback_submitted = true
   ├─→ Send coupon email to customer
   └─→ Show success message with coupon code

4. Admin Views Feedback
   ├─→ API: GET /api/feedback/all
   ├─→ Shows all feedback with:
   │   ├─→ Customer name
   │   ├─→ Product ratings
   │   ├─→ Delivery rating
   │   ├─→ Driver rating
   │   └─→ Comments
   └─→ Used for quality improvement
```

---

## 💳 Coupon System Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   COUPON LIFECYCLE                            │
└──────────────────────────────────────────────────────────────┘

COUPON CREATION (After Feedback)
├─→ Generate code: FFH + 8 random chars
├─→ Amount: £2.00
├─→ Expires: 6 months
├─→ Used: false
└─→ Email sent to customer

COUPON USAGE (During Checkout)
├─→ Customer enters code
├─→ API: POST /api/payment/verify-coupon
├─→ Validations:
│   ├─→ Code exists? ✓
│   ├─→ Not used? ✓
│   └─→ Not expired? ✓
├─→ If valid: Return discount amount
├─→ Apply discount to total
├─→ Create order/payment with coupon
└─→ Mark coupon as used

COUPON STATES
├─→ VALID: Not used, not expired
├─→ USED: Already redeemed
├─→ EXPIRED: Past expiration date
└─→ INVALID: Code doesn't exist
```

---

## 📧 Notification System

```
┌──────────────────────────────────────────────────────────────┐
│                   NOTIFICATIONS FLOW                          │
└──────────────────────────────────────────────────────────────┘

ORDER CONFIRMATION
├─→ Trigger: Order created
├─→ Recipients: Customer + Admin
├─→ Method: WhatsApp + Email
└─→ Content: Order details, items, total

LOW STOCK ALERT
├─→ Trigger: Inventory ≤ 10
├─→ Recipient: Admin
├─→ Method: WhatsApp
└─→ Content: Product name, current stock

FEEDBACK REQUEST
├─→ Trigger: Order marked as delivered
├─→ Recipient: Customer
├─→ Method: Email
└─→ Content: Feedback link, order details

COUPON DELIVERY
├─→ Trigger: Feedback submitted
├─→ Recipient: Customer
├─→ Method: Email
└─→ Content: Coupon code, expiry date

ORDER CANCELLATION
├─→ Trigger: Order cancelled
├─→ Recipient: Customer
├─→ Method: Email
└─→ Content: Cancellation confirmation, refund info
```

---

## 📊 Order Status States

```
┌──────────────────────────────────────────────────────────────┐
│                   ORDER STATUS FLOW                           │
└──────────────────────────────────────────────────────────────┘

PENDING
├─→ Initial state when order created
├─→ Payment received (if online)
├─→ Awaiting admin confirmation
└─→ Next: CONFIRMED or CANCELLED

CONFIRMED
├─→ Admin has reviewed and accepted order
├─→ Order is being prepared
└─→ Next: READY or CANCELLED

READY
├─→ Order is packed and ready for delivery
├─→ Awaiting driver assignment
└─→ Next: DELIVERED or CANCELLED

DELIVERED
├─→ Order successfully delivered to customer
├─→ Feedback email sent
├─→ Final state (unless cancelled)
└─→ Next: Feedback submission

CANCELLED
├─→ Order cancelled by admin or customer
├─→ Refund processed (if online payment)
├─→ Inventory restored
└─→ Final state
```

---

## 🗺️ Delivery Route Optimization

```
┌──────────────────────────────────────────────────────────────┐
│                   ROUTE OPTIMIZATION                          │
└──────────────────────────────────────────────────────────────┘

INPUT
├─→ List of orders (addresses)
├─→ Number of drivers
└─→ Store location (LS17 8RX)

PROCESS
1. Geocode Addresses
   ├─→ Convert addresses to coordinates
   ├─→ Use OpenRouteService Geocoding API
   └─→ Filter out invalid addresses

2. Split Orders
   ├─→ Divide orders among drivers
   └─→ Orders per driver = Total / NumDrivers

3. Optimize Each Route
   ├─→ Use OpenRouteService Optimization API
   ├─→ Input: Store + delivery locations
   ├─→ Algorithm finds best sequence
   └─→ Minimizes distance & time

4. Generate Route Geometry
   ├─→ Use OpenRouteService Directions API
   ├─→ Get turn-by-turn directions
   └─→ Calculate total distance & duration

OUTPUT
├─→ Optimized order sequence per driver
├─→ Route geometry (for map display)
├─→ Total distance (meters)
└─→ Total duration (seconds)
```

---

## 📦 Inventory Management

```
┌──────────────────────────────────────────────────────────────┐
│                   INVENTORY FLOW                              │
└──────────────────────────────────────────────────────────────┘

INVENTORY DECREASE (Order Created)
├─→ For each item in order:
│   ├─→ Get current inventory
│   ├─→ Subtract order quantity
│   ├─→ Update product inventory
│   └─→ If inventory ≤ 10: Send alert
└─→ Prevents overselling

INVENTORY INCREASE (Order Cancelled)
├─→ For each item in cancelled order:
│   ├─→ Get current inventory
│   ├─→ Add back order quantity
│   └─→ Update product inventory
└─→ Restores stock

INVENTORY TRACKING
├─→ Admin views product inventory
├─→ Low stock alerts (≤10 items)
├─→ Delivery recording increases stock
└─→ Real-time inventory updates
```

---

## 🔐 Payment Processing

```
┌──────────────────────────────────────────────────────────────┐
│                   STRIPE PAYMENT FLOW                         │
└──────────────────────────────────────────────────────────────┘

1. Create Checkout Session
   ├─→ Calculate total (with coupon discount)
   ├─→ Create Stripe session
   ├─→ Store metadata:
   │   ├─→ Customer info
   │   ├─→ Cart items
   │   └─→ Coupon code
   ├─→ Return session URL
   └─→ Redirect customer to Stripe

2. Customer Pays on Stripe
   ├─→ Enters card details
   ├─→ Stripe processes payment
   └─→ Payment success/failure

3. Webhook Receives Event
   ├─→ Event: checkout.session.completed
   ├─→ Verify webhook signature
   ├─→ Extract session metadata
   ├─→ Create order in database
   ├─→ Mark payment as PAID
   ├─→ Process order (inventory, notifications)
   └─→ Return success

4. Refund Processing (Cancellation)
   ├─→ Retrieve Stripe session
   ├─→ Get payment intent
   ├─→ Create refund
   ├─→ Stripe processes refund
   └─→ Customer receives refund
```

---

## 📈 Key Metrics & Analytics

```
┌──────────────────────────────────────────────────────────────┐
│                   TRACKABLE METRICS                           │
└──────────────────────────────────────────────────────────────┘

ORDER METRICS
├─→ Total orders
├─→ Orders by status
├─→ Average order value
├─→ Payment method distribution
└─→ Delivery vs Collection ratio

PRODUCT METRICS
├─→ Product ratings (from feedback)
├─→ Most ordered products
├─→ Low stock products
└─→ Inventory turnover

DELIVERY METRICS
├─→ Average delivery time
├─→ Driver performance
├─→ Route efficiency
└─→ Delivery success rate

CUSTOMER METRICS
├─→ Feedback submission rate
├─→ Average ratings
├─→ Coupon usage rate
└─→ Repeat customer rate
```

---

## 🎯 Business Rules

```
┌──────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC                              │
└──────────────────────────────────────────────────────────────┘

COUPON RULES
├─→ Generated after feedback submission
├─→ Value: £2.00
├─→ Expiry: 6 months
├─→ One-time use only
└─→ Cannot be combined with other coupons

FEEDBACK RULES
├─→ Only for delivered orders
├─→ One feedback per order
├─→ Generates £2 coupon
└─→ Cannot resubmit feedback

INVENTORY RULES
├─→ Low stock alert at ≤10 items
├─→ Prevent negative inventory
├─→ Real-time updates
└─→ Automatic alerts to admin

DELIVERY RULES
├─→ Only READY orders can be assigned
├─→ One driver per order
├─→ Route optimization for efficiency
└─→ Driver can mark as delivered

PAYMENT RULES
├─→ CASH: Pay on delivery
├─→ ONLINE: Stripe payment required
├─→ Refunds only for online payments
└─→ Webhook ensures payment verification
```

---

## 🚨 Error Handling

```
┌──────────────────────────────────────────────────────────────┐
│                   ERROR SCENARIOS                             │
└──────────────────────────────────────────────────────────────┘

PAYMENT FAILURES
├─→ Stripe payment declined
│   └─→ Show error, allow retry
├─→ Webhook signature invalid
│   └─→ Reject request, log error
└─→ Session expired
    └─→ Create new session

COUPON ERRORS
├─→ Invalid code
│   └─→ Show "Invalid coupon code"
├─→ Already used
│   └─→ Show "Coupon already used"
└─→ Expired
    └─→ Show "Coupon expired"

DELIVERY ERRORS
├─→ Geocoding fails
│   └─→ Skip address, notify admin
├─→ Route optimization fails
│   └─→ Use simple order, log error
└─→ No drivers available
    └─→ Show error, manual assignment

INVENTORY ERRORS
├─→ Out of stock
│   └─→ Prevent order, show message
├─→ Insufficient stock
│   └─→ Limit quantity, show warning
└─→ Negative inventory
    └─→ Prevent, log error
```

---

## 📱 User Interfaces

```
┌──────────────────────────────────────────────────────────────┐
│                   UI COMPONENTS                               │
└──────────────────────────────────────────────────────────────┘

CUSTOMER FRONTEND
├─→ Product catalog
├─→ Shopping cart
├─→ Checkout form
├─→ Payment selection
├─→ Order confirmation
└─→ Feedback form

ADMIN DASHBOARD
├─→ Order management
├─→ Product management
├─→ Inventory tracking
├─→ Delivery route planning
├─→ Driver assignment
├─→ Feedback viewing
└─→ Analytics dashboard

DRIVER APP
├─→ Login
├─→ View assigned deliveries
├─→ Optimized route map
├─→ Mark as delivered
└─→ Delivery history
```

---

## 🔄 Complete Flow Summary

```
1. CUSTOMER ORDERS
   └─→ Browse → Add to Cart → Apply Coupon → Checkout → Pay

2. ORDER PROCESSING
   └─→ Create Order → Confirm → Prepare → Ready

3. DELIVERY
   └─→ Generate Routes → Assign Driver → Deliver

4. FEEDBACK
   └─→ Email Sent → Customer Submits → Coupon Generated

5. NEXT ORDER
   └─→ Customer Uses Coupon → Cycle Repeats
```

---

**Last Updated:** January 2025  
**Version:** 1.0.0
