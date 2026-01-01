const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Admin APIs
export const adminLogin = async (username: string, password: string) => {
  const response = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return response.json()
}

export const fetchAdminUsers = async () => {
  const response = await fetch(`${BASE_URL}/admin/users`)
  return response.json()
}

export const createAdmin = async (adminId: string, username: string, password: string, is_super_admin: boolean) => {
  const response = await fetch(`${BASE_URL}/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'admin-id': adminId
    },
    body: JSON.stringify({ username, password, is_super_admin }),
  })
  return response.ok
}

export const deleteAdmin = async (adminId: string, id: number) => {
  const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'admin-id': adminId
    },
  })
  return response.ok
}

export const toggleAdminStatus = async (adminId: string, id: number, is_active: boolean) => {
  const response = await fetch(`${BASE_URL}/admin/users/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'admin-id': adminId
    },
    body: JSON.stringify({ is_active }),
  })
  return response.ok
}

// Order APIs
export const fetchOrders = async () => {
  const response = await fetch(`${BASE_URL}/orders`)
  return response.json()
}

export const updateOrderStatus = async (id: number, status: string) => {
  const response = await fetch(`${BASE_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  return response.ok
}

export const cancelOrder = async (id: number) => {
  const response = await fetch(`${BASE_URL}/orders/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  return response.ok
}

// Category APIs
export const fetchCategories = async () => {
  const response = await fetch(`${BASE_URL}/categories`)
  return response.json()
}

export const createCategory = async (name: string, description: string, image_url: string) => {
  const response = await fetch(`${BASE_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, image_url }),
  })
  return response.ok
}

export const updateCategory = async (id: number, name: string, description: string, image_url: string) => {
  const response = await fetch(`${BASE_URL}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, image_url }),
  })
  return response.ok
}

export const deleteCategory = async (id: number) => {
  const response = await fetch(`${BASE_URL}/categories/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete category')
  }
  return true
}

// Delivery APIs
export const fetchDrivers = async () => {
  const response = await fetch(`${BASE_URL}/admin/drivers`)
  return response.json()
}

export const generateRoutes = async (numDrivers: number) => {
  const response = await fetch(`${BASE_URL}/delivery/generate-routes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numDrivers }),
  })
  return response.json()
}

export const generateRoutesFromOrders = async (orders: unknown[], numDrivers: number) => {
  const response = await fetch(`${BASE_URL}/delivery/generate-routes-from-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orders, numDrivers }),
  })
  return response.json()
}

export const assignRoute = async (driverId: number, orderIds: number[], routeData: unknown) => {
  const response = await fetch(`${BASE_URL}/delivery/assign-route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driverId, orderIds, routeData }),
  })
  return response.ok
}

export const createDriver = async (username: string, password: string) => {
  const adminState = localStorage.getItem('adminLoginState')
  const adminId = adminState ? JSON.parse(adminState).adminId : ''
  
  const response = await fetch(`${BASE_URL}/admin/drivers`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'admin-id': adminId
    },
    body: JSON.stringify({ username, password }),
  })
  return response.ok
}

export const getDriverDeliveries = async (driverId: string) => {
  const response = await fetch(`${BASE_URL}/delivery/driver-deliveries`, {
    headers: { 'driver-id': driverId }
  })
  return response.json()
}

export const markAsDelivered = async (orderId: number) => {
  const response = await fetch(`${BASE_URL}/delivery/mark-delivered/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  })
  return response.ok
}

// Product APIs
export const fetchProducts = async () => {
  const response = await fetch(`${BASE_URL}/products`)
  return response.json()
}

export const createProduct = async (name: string, description: string, price: number, weight: string, category_id: number, image_url: string, inventory: number) => {
  const response = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, price, weight, category_id, image_url, inventory }),
  })
  return response.ok
}

export const updateProduct = async (id: number, name: string, description: string, price: number, weight: string, category_id: number, image_url: string, inventory: number) => {
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, price, weight, category_id, image_url, inventory }),
  })
  return response.ok
}

export const deleteProduct = async (id: number) => {
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete product')
  }
  return true
}

export const recordDelivery = async (deliveryDate: string, items: { product_id: number; quantity: number }[]) => {
  const response = await fetch(`${BASE_URL}/products/record-delivery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deliveryDate, items }),
  })
  return response.ok
}

export const fetchDeliveries = async () => {
  const response = await fetch(`${BASE_URL}/products/deliveries/history`)
  return response.json()
}

export const fetchFeedbacks = async () => {
  const response = await fetch(`${BASE_URL}/feedback/all`)
  return response.json()
}

export const toggleCategoryStatus = async (id: number, isActive: boolean) => {
  const response = await fetch(`${BASE_URL}/categories/${id}/toggle`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active: isActive }),
  })
  return response.ok
}

export const toggleProductStatus = async (id: number, isActive: boolean) => {
  const response = await fetch(`${BASE_URL}/products/${id}/toggle`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active: isActive }),
  })
  return response.ok
}