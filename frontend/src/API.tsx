const BASE_URL = 'http://localhost:5000/api'

// Category APIs
export const fetchCategories = async () => {
  const response = await fetch(`${BASE_URL}/categories`)
  return response.json()
}

// Product APIs
export const fetchProducts = async () => {
  const response = await fetch(`${BASE_URL}/products`)
  return response.json()
}

export const fetchProductsByCategory = async (categoryId: number) => {
  const response = await fetch(`${BASE_URL}/products/category/${categoryId}`)
  return response.json()
}