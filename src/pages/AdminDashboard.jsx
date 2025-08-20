"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getAllProducts, updateProductStock, addProduct, getAllOrders } from "../utils/productData.js"

const AdminDashboard = () => {
  const [products, setProducts] = useState({})
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [editingProduct, setEditingProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    image: "/placeholder.svg?height=100&width=100",
  })
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [bulkUpdateMode, setBulkUpdateMode] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState(new Set())
  const [bulkStockValue, setBulkStockValue] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsData, ordersData] = await Promise.all([getAllProducts(), getAllOrders()])
      setProducts(productsData || {})
      setOrders(ordersData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStockUpdate = async (productId, newStock) => {
    try {
      await updateProductStock(productId, Number.parseInt(newStock))
      setProducts((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          stock: Number.parseInt(newStock),
        },
      }))
      setEditingProduct(null)
    } catch (error) {
      console.error("Error updating stock:", error)
      alert("Failed to update stock")
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      const productData = {
        ...newProduct,
        price: Number.parseFloat(newProduct.price),
        stock: Number.parseInt(newProduct.stock),
      }

      await addProduct(productData)
      await fetchData() // Refresh data
      setNewProduct({
        id: "",
        name: "",
        price: "",
        description: "",
        category: "",
        stock: "",
        image: "/placeholder.svg?height=100&width=100",
      })
      setShowAddProduct(false)
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Failed to add product")
    }
  }

  const handleBulkStockUpdate = async () => {
    if (!bulkStockValue || selectedProducts.size === 0) {
      alert("Please select products and enter a stock value")
      return
    }

    try {
      const updatePromises = Array.from(selectedProducts).map((productId) =>
        updateProductStock(productId, Number.parseInt(bulkStockValue)),
      )

      await Promise.all(updatePromises)
      await fetchData() // Refresh data
      setSelectedProducts(new Set())
      setBulkStockValue("")
      setBulkUpdateMode(false)
    } catch (error) {
      console.error("Error bulk updating stock:", error)
      alert("Failed to update stock for some products")
    }
  }

  const getFilteredProducts = () => {
    return Object.values(products).filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && product.stock <= 10) ||
        (stockFilter === "out" && product.stock === 0) ||
        (stockFilter === "available" && product.stock > 0)
      return matchesSearch && matchesCategory && matchesStock
    })
  }

  const getCategories = () => {
    const categories = new Set(Object.values(products).map((p) => p.category))
    return Array.from(categories)
  }

  const getAnalytics = () => {
    const productList = Object.values(products)
    const totalProducts = productList.length
    const totalStock = productList.reduce((sum, p) => sum + p.stock, 0)
    const lowStockProducts = productList.filter((p) => p.stock <= 10).length
    const outOfStockProducts = productList.filter((p) => p.stock === 0).length
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
    const completedOrders = orders.filter((o) => o.status === "completed").length

    return {
      totalProducts,
      totalStock,
      lowStockProducts,
      outOfStockProducts,
      totalRevenue,
      completedOrders,
      totalOrders: orders.length,
    }
  }

  const analytics = getAnalytics()
  const filteredProducts = getFilteredProducts()

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>Admin Dashboard</h1>
          <p>Loading inventory data...</p>
        </div>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Admin Inventory Dashboard</h1>
        <p>Manage your inventory and track sales performance</p>
      </div>

      <div className="nav-buttons">
        <Link to="/" className="nav-btn secondary">
          ← Back to Home
        </Link>
        <Link to="/orders" className="nav-btn secondary">
          📋 View Orders
        </Link>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "2rem",
          borderBottom: "2px solid #e9ecef",
          overflowX: "auto",
        }}
      >
        {[
          { id: "overview", label: "📊 Overview", icon: "📊" },
          { id: "inventory", label: "📦 Inventory", icon: "📦" },
          { id: "analytics", label: "📈 Analytics", icon: "📈" },
          { id: "settings", label: "⚙️ Settings", icon: "⚙️" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "1rem 1.5rem",
              background: activeTab === tab.id ? "#007bff" : "transparent",
              color: activeTab === tab.id ? "white" : "#666",
              border: "none",
              borderBottom: activeTab === tab.id ? "3px solid #007bff" : "3px solid transparent",
              cursor: "pointer",
              fontWeight: activeTab === tab.id ? "600" : "400",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          {/* Analytics Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📦</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                {analytics.totalProducts}
              </div>
              <div>Total Products</div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📊</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{analytics.totalStock}</div>
              <div>Total Stock Units</div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⚠️</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                {analytics.lowStockProducts}
              </div>
              <div>Low Stock Alerts</div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🚫</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                {analytics.outOfStockProducts}
              </div>
              <div>Out of Stock</div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>💰</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                ₹{analytics.totalRevenue.toFixed(2)}
              </div>
              <div>Total Revenue</div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #17a2b8 0%, #138496 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📋</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                {analytics.completedOrders}
              </div>
              <div>Completed Orders</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              marginBottom: "2rem",
            }}
          >
            <h3 style={{ marginBottom: "1.5rem" }}>Quick Actions</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              <button
                onClick={() => setShowAddProduct(true)}
                style={{
                  padding: "1rem",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                ➕ Add New Product
              </button>

              <button
                onClick={() => setBulkUpdateMode(!bulkUpdateMode)}
                style={{
                  padding: "1rem",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                📦 Bulk Stock Update
              </button>

              <button
                onClick={() => setActiveTab("inventory")}
                style={{
                  padding: "1rem",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                📋 Manage Inventory
              </button>

              <button
                onClick={fetchData}
                style={{
                  padding: "1rem",
                  background: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {analytics.lowStockProducts > 0 && (
            <div
              style={{
                background: "#fff3cd",
                border: "1px solid #ffeaa7",
                borderRadius: "12px",
                padding: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <h3 style={{ color: "#856404", marginBottom: "1rem" }}>⚠️ Low Stock Alerts</h3>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {Object.values(products)
                  .filter((p) => p.stock <= 10)
                  .slice(0, 5)
                  .map((product) => (
                    <div
                      key={product.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem",
                        background: "white",
                        borderRadius: "6px",
                      }}
                    >
                      <span>{product.name}</span>
                      <span
                        style={{
                          color: product.stock === 0 ? "#dc3545" : "#ffc107",
                          fontWeight: "600",
                        }}
                      >
                        {product.stock === 0 ? "OUT OF STOCK" : `${product.stock} left`}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div>
          {/* Filters */}
          <div
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                alignItems: "end",
              }}
            >
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Search Products</label>
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                  }}
                >
                  <option value="all">All Categories</option>
                  {getCategories().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Stock Status</label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                  }}
                >
                  <option value="all">All Products</option>
                  <option value="available">In Stock</option>
                  <option value="low">Low Stock (≤10)</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Update Mode */}
          {bulkUpdateMode && (
            <div
              style={{
                background: "#e3f2fd",
                border: "1px solid #bbdefb",
                borderRadius: "12px",
                padding: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <h3 style={{ color: "#0d47a1", marginBottom: "1rem" }}>📦 Bulk Stock Update</h3>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="number"
                  placeholder="New stock quantity"
                  value={bulkStockValue}
                  onChange={(e) => setBulkStockValue(e.target.value)}
                  style={{
                    padding: "0.75rem",
                    border: "2px solid #bbdefb",
                    borderRadius: "8px",
                    minWidth: "200px",
                  }}
                />
                <button
                  onClick={handleBulkStockUpdate}
                  disabled={selectedProducts.size === 0 || !bulkStockValue}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: selectedProducts.size === 0 || !bulkStockValue ? "#ccc" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: selectedProducts.size === 0 || !bulkStockValue ? "not-allowed" : "pointer",
                  }}
                >
                  Update {selectedProducts.size} Products
                </button>
                <button
                  onClick={() => {
                    setBulkUpdateMode(false)
                    setSelectedProducts(new Set())
                    setBulkStockValue("")
                  }}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  border:
                    product.stock === 0
                      ? "2px solid #dc3545"
                      : product.stock <= 10
                        ? "2px solid #ffc107"
                        : "1px solid #e9ecef",
                }}
              >
                {bulkUpdateMode && (
                  <div style={{ marginBottom: "1rem" }}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedProducts)
                        if (e.target.checked) {
                          newSelected.add(product.id)
                        } else {
                          newSelected.delete(product.id)
                        }
                        setSelectedProducts(newSelected)
                      }}
                      style={{ marginRight: "0.5rem" }}
                    />
                    <label>Select for bulk update</label>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 0.25rem 0" }}>{product.name}</h4>
                    <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
                      ID: {product.id} | ₹{product.price}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <span style={{ fontWeight: "600" }}>Stock:</span>
                  <span
                    style={{
                      color: product.stock === 0 ? "#dc3545" : product.stock <= 10 ? "#ffc107" : "#28a745",
                      fontWeight: "bold",
                    }}
                  >
                    {product.stock} units
                  </span>
                </div>

                {editingProduct === product.id ? (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="number"
                      defaultValue={product.stock}
                      min="0"
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        border: "2px solid #007bff",
                        borderRadius: "6px",
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleStockUpdate(product.id, e.target.value)
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.parentElement.querySelector("input")
                        handleStockUpdate(product.id, input.value)
                      }}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingProduct(null)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingProduct(product.id)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    📝 Update Stock
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            {/* Category Breakdown */}
            <div
              style={{
                background: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ marginBottom: "1.5rem" }}>📊 Products by Category</h3>
              {getCategories().map((category) => {
                const categoryProducts = Object.values(products).filter((p) => p.category === category)
                const percentage = ((categoryProducts.length / Object.values(products).length) * 100).toFixed(1)
                return (
                  <div key={category} style={{ marginBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span>{category}</span>
                      <span>
                        {categoryProducts.length} ({percentage}%)
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        background: "#e9ecef",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          background: "#007bff",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Stock Status */}
            <div
              style={{
                background: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ marginBottom: "1.5rem" }}>📦 Stock Status Overview</h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1rem",
                    background: "#d4edda",
                    borderRadius: "8px",
                  }}
                >
                  <span>✅ In Stock</span>
                  <span style={{ fontWeight: "bold" }}>
                    {Object.values(products).filter((p) => p.stock > 10).length}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1rem",
                    background: "#fff3cd",
                    borderRadius: "8px",
                  }}
                >
                  <span>⚠️ Low Stock</span>
                  <span style={{ fontWeight: "bold" }}>
                    {Object.values(products).filter((p) => p.stock > 0 && p.stock <= 10).length}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1rem",
                    background: "#f8d7da",
                    borderRadius: "8px",
                  }}
                >
                  <span>🚫 Out of Stock</span>
                  <span style={{ fontWeight: "bold" }}>
                    {Object.values(products).filter((p) => p.stock === 0).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Revenue Analytics */}
            <div
              style={{
                background: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ marginBottom: "1.5rem" }}>💰 Revenue Analytics</h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1rem",
                    background: "#e3f2fd",
                    borderRadius: "8px",
                  }}
                >
                  <span>Total Revenue</span>
                  <span style={{ fontWeight: "bold" }}>₹{analytics.totalRevenue.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1rem",
                    background: "#f3e5f5",
                    borderRadius: "8px",
                  }}
                >
                  <span>Average Order Value</span>
                  <span style={{ fontWeight: "bold" }}>
                    ₹{analytics.totalOrders > 0 ? (analytics.totalRevenue / analytics.totalOrders).toFixed(2) : "0.00"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1rem",
                    background: "#e8f5e8",
                    borderRadius: "8px",
                  }}
                >
                  <span>Completed Orders</span>
                  <span style={{ fontWeight: "bold" }}>{analytics.completedOrders}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Product ID *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.id}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, id: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e9ecef",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e9ecef",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e9ecef",
                        borderRadius: "8px",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                      Initial Stock *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, stock: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e9ecef",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Category *</label>
                  <select
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e9ecef",
                      borderRadius: "8px",
                    }}
                  >
                    <option value="">Select Category</option>
                    {getCategories().map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Description *</label>
                  <textarea
                    required
                    value={newProduct.description}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e9ecef",
                      borderRadius: "8px",
                      minHeight: "80px",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "2rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
