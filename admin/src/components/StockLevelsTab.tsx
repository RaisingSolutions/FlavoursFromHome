/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'
import * as API from '../APIS'

export default function StockLevelsTab({ userLocation, isSuperAdmin }: { userLocation: string | null, isSuperAdmin: boolean }) {
  const [products, setProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const fetchProducts = useCallback(async () => {
    try {
      const data = await API.fetchProducts()
      setProducts(data)
    } catch {
      console.error('Failed to fetch products')
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const getInventoryForLocation = (product: any) => {
    if (userLocation === 'Leeds') return product.inventory_leeds
    if (userLocation === 'Derby') return product.inventory_derby
    if (userLocation === 'Sheffield') return product.inventory_sheffield
    return 0
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="stock-levels-section">
      <div className="section-header">
        <h2>Stock Levels</h2>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', width: '300px' }}
        />
      </div>

      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#34495e', color: 'white' }}>
              <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #ddd' }}>Product Name</th>
              <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #ddd' }}>Category</th>
              {isSuperAdmin ? (
                <>
                  <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd', background: '#3498db' }}>Leeds Stock</th>
                  <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd', background: '#e74c3c' }}>Derby Stock</th>
                  <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd', background: '#2ecc71' }}>Sheffield Stock</th>
                </>
              ) : (
                <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>Current Stock</th>
              )}
              <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const inventory = isSuperAdmin ? Math.min(product.inventory_leeds, product.inventory_derby, product.inventory_sheffield) : getInventoryForLocation(product)
              return (
                <tr key={product.id} style={{ background: inventory === 0 ? '#ffebee' : inventory <= 10 ? '#fff3cd' : 'white' }}>
                  <td style={{ padding: '15px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                    {product.name}
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #ddd' }}>
                    {product.categories?.name || '-'}
                  </td>
                  {isSuperAdmin ? (
                    <>
                      <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', background: product.inventory_leeds <= 10 ? '#fff3cd' : 'white' }}>
                        {product.inventory_leeds}
                      </td>
                      <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', background: product.inventory_derby <= 10 ? '#fff3cd' : 'white' }}>
                        {product.inventory_derby}
                      </td>
                      <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', background: product.inventory_sheffield <= 10 ? '#fff3cd' : 'white' }}>
                        {product.inventory_sheffield}
                      </td>
                    </>
                  ) : (
                    <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                      {inventory}
                    </td>
                  )}
                  <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {inventory === 0 ? (
                      <span style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Out of Stock</span>
                    ) : inventory <= 10 ? (
                      <span style={{ color: '#ff9800', fontWeight: 'bold' }}>⚠️ Low Stock</span>
                    ) : (
                      <span style={{ color: 'green', fontWeight: 'bold' }}>✓ In Stock</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-data-message">
          <div className="no-data-icon">📦</div>
          <h3>No Products Found</h3>
          <p>Try adjusting your search.</p>
        </div>
      )}
    </div>
  )
}
