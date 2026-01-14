# Location-Based Multi-Location System - Backend Implementation

## Overview
This system enables Flavours From Home to operate in 3 locations (Leeds, Derby, Sheffield) with separate inventory, orders, and admin management for each location.

## Database Changes

### 1. Products Table
**New Columns:**
- `inventory_leeds` (INTEGER) - Inventory count for Leeds
- `inventory_derby` (INTEGER) - Inventory count for Derby  
- `inventory_sheffield` (INTEGER) - Inventory count for Sheffield

**Migration:** Run `location-based-inventory.sql`

### 2. Orders Table
**New Column:**
- `location` (VARCHAR) - Customer's location (Leeds/Derby/Sheffield)

### 3. Admin Users Table
**New Column:**
- `location` (VARCHAR) - Admin's assigned location (NULL for super admin)

## API Changes

### Products API

#### GET `/api/products?location=Leeds`
**Query Parameters:**
- `location` (optional): Leeds, Derby, or Sheffield
- `admin` (optional): true/false

**Response:**
```json
{
  "id": 1,
  "name": "Product Name",
  "price": 5.99,
  "inventory": 10,  // Location-specific inventory
  "inventory_leeds": 10,
  "inventory_derby": 5,
  "inventory_sheffield": 8
}
```

**Behavior:**
- If `location` is provided, returns `inventory` field with location-specific count
- Admins see all 3 inventory columns
- Customers only see their location's inventory

#### POST `/api/products`
**Request Body:**
```json
{
  "name": "Product Name",
  "price": 5.99,
  "inventory_leeds": 10,
  "inventory_derby": 5,
  "inventory_sheffield": 8
}
```

#### PUT `/api/products/:id`
**Request Body:**
```json
{
  "name": "Product Name",
  "inventory_leeds": 10,
  "inventory_derby": 5,
  "inventory_sheffield": 8
}
```

**WhatsApp Alerts:**
- Sends alert if ANY location inventory ≤ 10
- Message includes all low-stock locations

#### POST `/api/products/delivery`
**Request Body:**
```json
{
  "deliveryDate": "2025-01-15",
  "location": "Leeds",
  "items": [
    { "product_id": 1, "quantity": 50 }
  ]
}
```

**Behavior:**
- Updates only the specified location's inventory

### Orders API

#### GET `/api/orders?location=Leeds`
**Query Parameters:**
- `location` (optional): Filter orders by location

**Response:**
```json
{
  "id": 1,
  "first_name": "John",
  "location": "Leeds",
  "total_amount": 45.99,
  "status": "pending"
}
```

**Behavior:**
- Super admin: No filter, sees all orders
- Location admin: Automatically filtered by their location

#### POST `/api/orders`
**Request Body:**
```json
{
  "first_name": "John",
  "email": "john@example.com",
  "location": "Leeds",
  "items": [...]
}
```

### Admin API

#### POST `/api/admin/login`
**Response:**
```json
{
  "id": 1,
  "username": "leeds_admin",
  "role": "admin",
  "location": "Leeds",
  "is_super_admin": false
}
```

**Behavior:**
- Returns user's assigned location
- Super admin has `location: null`

#### POST `/api/admin/create`
**Request Body:**
```json
{
  "username": "leeds_admin",
  "password": "password123",
  "is_super_admin": false,
  "location": "Leeds"
}
```

**Validation:**
- Super admin must have `location: null`
- Location admin must have valid location

#### POST `/api/admin/drivers`
**Request Body:**
```json
{
  "username": "driver_leeds",
  "password": "password123",
  "location": "Leeds"
}
```

**Behavior:**
- Drivers are location-specific
- Can only see deliveries for their location

### Payment API

#### POST `/api/payment/create-checkout-session`
**Request Body:**
```json
{
  "cart": [...],
  "customerInfo": {
    "firstName": "John",
    "email": "john@example.com",
    "location": "Leeds"
  }
}
```

**Behavior:**
- Stores location in Stripe metadata
- Creates order with customer's location

## Admin Roles & Permissions

### Super Admin
**Permissions:**
- ✅ View all locations' inventory
- ✅ View all locations' orders
- ✅ View analytics for all locations
- ❌ Cannot mark orders ready
- ❌ Cannot assign drivers
- ❌ Cannot manage deliveries

**Use Case:** Owner/manager who monitors all locations

### Location Admin (Leeds/Derby/Sheffield)
**Permissions:**
- ✅ View/edit ONLY their location's inventory
- ✅ View/manage ONLY their location's orders
- ✅ Mark orders ready
- ✅ Assign drivers (from their location)
- ✅ Manage deliveries
- ❌ Cannot see other locations' data

**Use Case:** Store manager for specific location

### Driver (Location-Specific)
**Permissions:**
- ✅ View assigned deliveries (their location only)
- ✅ Mark orders as delivered
- ❌ Cannot see other locations' deliveries

## Frontend Integration

### Customer Flow
1. **Homepage:** Select/detect location (Leeds/Derby/Sheffield)
2. **Products:** See location-specific inventory
3. **Cart:** Items from selected location only
4. **Checkout:** Location sent with order

### Admin Flow
1. **Login:** Returns user's location
2. **Dashboard:** Filtered by location (or all for super admin)
3. **Products:** Edit location-specific inventory
4. **Orders:** See location-specific orders

## Testing

### Test Scenarios

#### 1. Create Location Admins
```bash
POST /api/admin/create
{
  "username": "leeds_admin",
  "password": "test123",
  "location": "Leeds"
}
```

#### 2. Create Super Admin
```bash
POST /api/admin/create
{
  "username": "super_admin",
  "password": "test123",
  "is_super_admin": true
}
```

#### 3. Get Products by Location
```bash
GET /api/products?location=Leeds
```

#### 4. Create Order with Location
```bash
POST /api/orders
{
  "first_name": "John",
  "location": "Leeds",
  "items": [...]
}
```

#### 5. Filter Orders by Location
```bash
GET /api/orders?location=Leeds
```

## Migration Steps

### 1. Run SQL Migration
```bash
psql -h your-supabase-url -U postgres -d postgres -f location-based-inventory.sql
```

### 2. Create Initial Admins
```bash
# Super Admin
POST /api/admin/create
{ "username": "super_admin", "password": "...", "is_super_admin": true }

# Leeds Admin
POST /api/admin/create
{ "username": "leeds_admin", "password": "...", "location": "Leeds" }

# Derby Admin
POST /api/admin/create
{ "username": "derby_admin", "password": "...", "location": "Derby" }

# Sheffield Admin
POST /api/admin/create
{ "username": "sheffield_admin", "password": "...", "location": "Sheffield" }
```

### 3. Update Existing Products
```bash
# Set initial inventory for all locations
UPDATE products SET 
  inventory_leeds = inventory,
  inventory_derby = inventory,
  inventory_sheffield = inventory;
```

### 4. Test API Endpoints
- Test product filtering by location
- Test order creation with location
- Test admin login returns location
- Test location-based order filtering

## Backward Compatibility

### Old `inventory` Column
- Kept for backward compatibility
- Can be dropped after migration: `ALTER TABLE products DROP COLUMN inventory;`

### Existing Orders
- Old orders without location will have `location = NULL`
- Frontend should handle NULL location gracefully

## Security Considerations

### Location Validation
- Validate location is one of: Leeds, Derby, Sheffield
- Prevent location tampering in requests
- Verify admin can only access their location's data

### Admin Middleware
```typescript
// Check if admin can access location
if (admin.location && admin.location !== requestedLocation) {
  return res.status(403).json({ error: 'Access denied' });
}
```

## Next Steps

1. ✅ Backend API updated
2. ⏳ Frontend location detection
3. ⏳ Admin dashboard location filtering
4. ⏳ Customer location selection UI
5. ⏳ Testing & deployment

## Support

For questions or issues:
- Check API documentation: `/api-docs`
- Review this document
- Test with Postman collection
