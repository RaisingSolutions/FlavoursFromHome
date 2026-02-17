const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Category APIs
export const fetchCategories = async () => {
  const response = await fetch(`${BASE_URL}/categories`)
  return response.json()
}

// Product APIs
export const fetchProducts = async (location?: string) => {
  const url = location ? `${BASE_URL}/products?location=${location}` : `${BASE_URL}/products`
  const response = await fetch(url)
  return response.json()
}

export const fetchProductsByCategory = async (categoryId: number, location?: string) => {
  const url = location 
    ? `${BASE_URL}/products/category/${categoryId}?location=${location}`
    : `${BASE_URL}/products/category/${categoryId}`
  const response = await fetch(url)
  return response.json()
}

export const fetchDeals = async () => {
  const response = await fetch(`${BASE_URL}/deals`)
  return response.json()
}