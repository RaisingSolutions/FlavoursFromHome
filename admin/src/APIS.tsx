const BASE_URL = 'http://localhost:5000/api'

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

// Product APIs
export const fetchProducts = async () => {
  const response = await fetch(`${BASE_URL}/products`)
  return response.json()
}

export const createProduct = async (name: string, description: string, price: number, weight: string, category_id: number, image_url: string) => {
  const response = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, price, weight, category_id, image_url }),
  })
  return response.ok
}

export const updateProduct = async (id: number, name: string, description: string, price: number, weight: string, category_id: number, image_url: string) => {
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, price, weight, category_id, image_url }),
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