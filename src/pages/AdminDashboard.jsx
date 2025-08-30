"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../utils/AuthContext.jsx"
import { makeAuthenticatedRequest } from "../utils/authUtils.js"
import toast from "react-hot-toast"

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

  const { admin, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin-login")
      return
    }
    fetchData()
  }, [isAuthenticated, navigate])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsResponse, ordersResponse] = await Promise.all([
        makeAuthenticatedRequest("/products"),
        makeAuthenticatedRequest("/orders"),
      ])

      const productsData = await productsResponse.json()
      const ordersData = await ordersResponse.json()

      setProducts(productsData || {})
      setOrders(ordersData || [])

      // Low stock notification check (≤ 5 units)
      const lowStockItems = Object.values(productsData || {}).filter((p) => p.stock <= 5)
      if (lowStockItems.length > 0) {
        lowStockItems.forEach((item) => {
          toast.error(`⚠️ ${item.name} stock is low (${item.stock} left)`, {
            duration: 4000,
          })
        })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleStockUpdate = async (productId, newStock) => {
    try {
      await makeAuthenticatedRequest(`/product/${productId}/stock`, {
        method: "PUT",
        body: JSON.stringify({ stock: Number.parseInt(newStock) }),
      })

      setProducts((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          stock: Number.parseInt(newStock),
        },
      }))
      setEditingProduct(null)
      toast.success("✅ Stock updated successfully")
    } catch (error) {
      console.error("Error updating stock:", error)
      toast.error("❌ Failed to update stock")
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

      const response = await makeAuthenticatedRequest("/products", {
        method: "POST",
        body: JSON.stringify(productData),
      })

      if (response.ok) {
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
        toast.success("✅ Product added successfully")
      }
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error("❌ Failed to add product")
    }
  }

  const handleBulkStockUpdate = async () => {
    if (!bulkStockValue || selectedProducts.size === 0) {
      toast.error("⚠️ Please select products and enter a stock value")
      return
    }

    try {
      const updatePromises = Array.from(selectedProducts).map((productId) =>
        makeAuthenticatedRequest(`/product/${productId}/stock`, {
          method: "PUT",
          body: JSON.stringify({ stock: Number.parseInt(bulkStockValue) }),
        }),
      )

      await Promise.all(updatePromises)
      await fetchData() // Refresh data
      setSelectedProducts(new Set())
      setBulkStockValue("")
      setBulkUpdateMode(false)
      toast.success("✅ Bulk stock updated successfully")
    } catch (error) {
      console.error("Error bulk updating stock:", error)
      toast.error("❌ Failed to update stock for some products")
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/admin-login")
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Error during logout")
    }
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

  const filteredProducts = Object.values(products).filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "available" && product.stock > 0) ||
      (stockFilter === "low" && product.stock > 0 && product.stock <= 10) ||
      (stockFilter === "out" && product.stock === 0)

    return matchesSearch && matchesCategory && matchesStock
  })

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e2e8f0",
              borderTop: "4px solid #007bff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "#666", margin: 0 }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "2rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>🎛️ Admin Dashboard</h1>
          <p style={{ margin: 0, color: "#666" }}>
            Welcome back, <strong>{admin?.username || "Admin"}</strong>! Manage your inventory and orders.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link
            to="/"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#6c757d",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "600",
            }}
          >
            🏠 Back to Home
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            🚪 Logout
          </button>
        </div>
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
          { id: "orders", label: "📋 Orders", icon: "📋" },
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
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
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
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                {analytics.totalStock}
              </div>
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
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
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
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
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
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
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
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
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
        </div>
      )}

      {activeTab === "orders" && (
        <div>
          {/* Orders Header */}
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}
            >
              <h2 style={{ margin: 0, color: "#333" }}>📋 Order Management</h2>
              <button
                onClick={() => {
                  // Generate sample invoice
                  const sampleOrder = orders[0] || {
                    id: "ORD001",
                    customerName: "John Doe",
                    customerEmail: "john@example.com",
                    items: [{ name: "Sample Product", quantity: 2, price: 299.99 }],
                    total: 599.98,
                    tax: 107.99,
                    paymentMethod: "Card",
                    date: new Date().toISOString(),
                  }
                  generateInvoice(sampleOrder)
                }}
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
                📄 Generate Sample Invoice
              </button>
            </div>

            {/* Order Filters */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Search Orders</label>
                <input
                  type="text"
                  placeholder="Search by order ID or customer..."
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Status Filter</label>
                <select
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                  }}
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Date Range</label>
                <input
                  type="date"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e9ecef",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#333" }}>Order ID</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#333" }}>Customer</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#333" }}>Products</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#333" }}>Amount</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#333" }}>Status</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#333" }}>Date</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#333" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order, index) => (
                      <tr key={order.id || index} style={{ borderBottom: "1px solid #e9ecef" }}>
                        <td style={{ padding: "1rem", fontWeight: "600", color: "#007bff" }}>
                          {order.id || `ORD${String(index + 1).padStart(3, "0")}`}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <div>
                            <div style={{ fontWeight: "600" }}>{order.customerName || "Guest Customer"}</div>
                            <div style={{ fontSize: "0.9rem", color: "#666" }}>{order.customerEmail || "N/A"}</div>
                          </div>
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ fontSize: "0.9rem" }}>{order.items?.length || 1} item(s)</div>
                        </td>
                        <td style={{ padding: "1rem", fontWeight: "600", color: "#28a745" }}>
                          ₹{(order.total || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "20px",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              background:
                                order.status === "completed"
                                  ? "#d4edda"
                                  : order.status === "pending"
                                    ? "#fff3cd"
                                    : "#f8d7da",
                              color:
                                order.status === "completed"
                                  ? "#155724"
                                  : order.status === "pending"
                                    ? "#856404"
                                    : "#721c24",
                            }}
                          >
                            {order.status || "pending"}
                          </span>
                        </td>
                        <td style={{ padding: "1rem", color: "#666" }}>
                          {order.date ? new Date(order.date).toLocaleDateString() : new Date().toLocaleDateString()}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              onClick={() => generateInvoice(order)}
                              style={{
                                padding: "0.5rem",
                                background: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                              }}
                            >
                              📄 Invoice
                            </button>
                            <button
                              style={{
                                padding: "0.5rem",
                                background: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                              }}
                            >
                              👁️ View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ padding: "3rem", textAlign: "center", color: "#666" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
                        <h3 style={{ margin: "0 0 0.5rem 0" }}>No orders found</h3>
                        <p style={{ margin: 0 }}>Orders will appear here once customers make purchases</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                  }}
                >
                  Search Products
                </label>
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
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                  }}
                >
                  Category
                </label>
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
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                  }}
                >
                  Stock Status
                </label>
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

            {/* Bulk Update Controls */}
            {bulkUpdateMode && (
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1.5rem",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  border: "2px solid #007bff",
                }}
              >
                <h4 style={{ marginBottom: "1rem", color: "#007bff" }}>📦 Bulk Stock Update Mode</h4>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "end",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: "1", minWidth: "200px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                      }}
                    >
                      New Stock Value
                    </label>
                    <input
                      type="number"
                      placeholder="Enter stock quantity"
                      value={bulkStockValue}
                      onChange={(e) => setBulkStockValue(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #007bff",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                  <button
                    onClick={handleBulkStockUpdate}
                    disabled={selectedProducts.size === 0 || !bulkStockValue}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: selectedProducts.size === 0 || !bulkStockValue ? "#6c757d" : "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: selectedProducts.size === 0 || !bulkStockValue ? "not-allowed" : "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Update Selected ({selectedProducts.size})
                  </button>
                  <button
                    onClick={() => {
                      setBulkUpdateMode(false)
                      setSelectedProducts(new Set())
                      setBulkStockValue("")
                    }}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

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
                  border: bulkUpdateMode
                    ? selectedProducts.has(product.id)
                      ? "3px solid #007bff"
                      : "3px solid transparent"
                    : "1px solid #e9ecef",
                  cursor: bulkUpdateMode ? "pointer" : "default",
                }}
                onClick={() => {
                  if (bulkUpdateMode) {
                    const newSelected = new Set(selectedProducts)
                    if (newSelected.has(product.id)) {
                      newSelected.delete(product.id)
                    } else {
                      newSelected.add(product.id)
                    }
                    setSelectedProducts(newSelected)
                  }
                }}
              >
                {bulkUpdateMode && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginBottom: "1rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => {}}
                      style={{
                        width: "20px",
                        height: "20px",
                        accentColor: "#007bff",
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: "0 0 0.5rem 0",
                        fontSize: "1.1rem",
                        color: "#333",
                      }}
                    >
                      {product.name}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "#666",
                        fontSize: "0.9rem",
                      }}
                    >
                      ID: {product.id}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "#666",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Price
                    </label>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "#28a745",
                      }}
                    >
                      ₹{product.price}
                    </div>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: "#666",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Category
                    </label>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        padding: "0.25rem 0.5rem",
                        background: "#e9ecef",
                        borderRadius: "4px",
                        display: "inline-block",
                      }}
                    >
                      {product.category}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      color: "#666",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Stock
                  </label>
                  {editingProduct === product.id ? (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        type="number"
                        defaultValue={product.stock}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleStockUpdate(product.id, e.target.value)
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: "0.5rem",
                          border: "2px solid #007bff",
                          borderRadius: "4px",
                        }}
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          const input = e.target.parentElement.querySelector("input")
                          handleStockUpdate(product.id, input.value)
                        }}
                        style={{
                          padding: "0.5rem",
                          background: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        style={{
                          padding: "0.5rem",
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          color: product.stock === 0 ? "#dc3545" : product.stock <= 10 ? "#ffc107" : "#28a745",
                        }}
                      >
                        {product.stock} units
                        {product.stock === 0 && " (Out of Stock)"}
                        {product.stock > 0 && product.stock <= 10 && " (Low Stock)"}
                      </span>
                      {!bulkUpdateMode && (
                        <button
                          onClick={() => setEditingProduct(product.id)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            background: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      color: "#666",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Description
                  </label>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                      color: "#666",
                      lineHeight: "1.4",
                    }}
                  >
                    {product.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
              <h3 style={{ color: "#666", marginBottom: "0.5rem" }}>No products found</h3>
              <p style={{ color: "#999", margin: 0 }}>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div>
          {/* Analytics Header */}
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              marginBottom: "2rem",
            }}
          >
            <h2 style={{ margin: "0 0 1rem 0", color: "#333" }}>📈 Analytics & Insights</h2>
            <p style={{ margin: 0, color: "#666" }}>Comprehensive overview of your business performance</p>
          </div>

          {/* Key Metrics Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            {/* Revenue Analytics */}
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>💰</div>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                ₹{analytics.totalRevenue.toFixed(2)}
              </div>
              <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>Total Revenue</div>
              <div style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "0.5rem" }}>+12.5% from last month</div>
            </div>

            {/* Sales Analytics */}
            <div
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📊</div>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                {analytics.completedOrders}
              </div>
              <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>Total Sales</div>
              <div style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "0.5rem" }}>
                {analytics.totalOrders} total orders
              </div>
            </div>

            {/* Inventory Health */}
            <div
              style={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📦</div>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                {analytics.totalStock}
              </div>
              <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>Total Inventory</div>
              <div style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "0.5rem" }}>
                {analytics.totalProducts} products
              </div>
            </div>

            {/* Low Stock Alert */}
            <div
              style={{
                background:
                  analytics.lowStockProducts > 0
                    ? "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                    : "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                {analytics.lowStockProducts > 0 ? "⚠️" : "✅"}
              </div>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                {analytics.lowStockProducts}
              </div>
              <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>Low Stock Items</div>
              <div style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "0.5rem" }}>
                {analytics.outOfStockProducts} out of stock
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
            {/* Sales Chart */}
            <div
              style={{
                background: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 1.5rem 0", color: "#333" }}>📈 Sales Trend</h3>
              <div
                style={{
                  height: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  border: "2px dashed #dee2e6",
                }}
              >
                <div style={{ textAlign: "center", color: "#666" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
                  <p style={{ margin: 0 }}>Sales chart visualization</p>
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>Integration with Chart.js recommended</p>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div
              style={{
                background: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 1.5rem 0", color: "#333" }}>🏆 Top Products</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {Object.values(products)
                  .sort((a, b) => (b.stock || 0) - (a.stock || 0))
                  .slice(0, 5)
                  .map((product, index) => (
                    <div
                      key={product.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          background:
                            index === 0 ? "#ffd700" : index === 1 ? "#c0c0c0" : index === 2 ? "#cd7f32" : "#e9ecef",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          color: index < 3 ? "white" : "#666",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{product.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>
                          {product.stock} units • ₹{product.price}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Stock Analysis */}
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#333" }}>📊 Stock Analysis</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              <div style={{ textAlign: "center", padding: "1.5rem", background: "#e8f5e8", borderRadius: "8px" }}>
                <div style={{ fontSize: "2rem", color: "#28a745", marginBottom: "0.5rem" }}>✅</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#28a745" }}>
                  {Object.values(products).filter((p) => p.stock > 10).length}
                </div>
                <div style={{ color: "#666" }}>Well Stocked</div>
              </div>
              <div style={{ textAlign: "center", padding: "1.5rem", background: "#fff3cd", borderRadius: "8px" }}>
                <div style={{ fontSize: "2rem", color: "#ffc107", marginBottom: "0.5rem" }}>⚠️</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#856404" }}>
                  {analytics.lowStockProducts}
                </div>
                <div style={{ color: "#666" }}>Low Stock</div>
              </div>
              <div style={{ textAlign: "center", padding: "1.5rem", background: "#f8d7da", borderRadius: "8px" }}>
                <div style={{ fontSize: "2rem", color: "#dc3545", marginBottom: "0.5rem" }}>🚫</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#721c24" }}>
                  {analytics.outOfStockProducts}
                </div>
                <div style={{ color: "#666" }}>Out of Stock</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div>
          {/* Settings Header */}
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              marginBottom: "2rem",
            }}
          >
            <h2 style={{ margin: "0 0 1rem 0", color: "#333" }}>⚙️ Settings & Configuration</h2>
            <p style={{ margin: 0, color: "#666" }}>Manage your admin profile and system preferences</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            {/* Admin Profile */}
            <div
              style={{
                background: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 1.5rem 0", color: "#333" }}>👤 Admin Profile</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Username</label>
                  <input
                    type="text"
                    value={admin?.username || "admin"}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e9ecef",
                      borderRadius: "8px",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Email</label>
                  <input
                    type="email"
                    value={admin?.email || "admin@tiptappay.com"}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e9ecef",
                      borderRadius: "8px",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>New Password</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e9ecef",
                      borderRadius: "8px",
                    }}
                  />
                </div>
                <button
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    marginTop: "1rem",
                  }}
                >
                  💾 Update Profile
                </button>
              </div>
            </div>

            {/* System Preferences */}
            <div
              style={{
                background: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 1.5rem 0", color: "#333" }}>🔧 System Preferences</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    defaultValue="10"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e9ecef",
                      borderRadius: "8px",
                    }}
                  />
                  <small style={{ color: "#666" }}>Alert when stock falls below this number</small>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Currency</label>
                  <select
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e9ecef",
                      borderRadius: "8px",
                    }}
                  >
                    <option value="INR">₹ Indian Rupee (INR)</option>
                    <option value="USD">$ US Dollar (USD)</option>
                    <option value="EUR">€ Euro (EUR)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked />
                    <span style={{ fontWeight: "600" }}>Email Notifications</span>
                  </label>
                  <small style={{ color: "#666", marginLeft: "1.5rem" }}>
                    Receive alerts for low stock and new orders
                  </small>
                </div>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked />
                    <span style={{ fontWeight: "600" }}>Auto-backup Data</span>
                  </label>
                  <small style={{ color: "#666", marginLeft: "1.5rem" }}>Automatically backup data daily</small>
                </div>
              </div>
            </div>
          </div>

          {/* Product Management */}
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              marginTop: "2rem",
            }}
          >
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#333" }}>📦 Product Management</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
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
                📦 Bulk Update Stock
              </button>
              <button
                onClick={() => {
                  const csvData = Object.values(products)
                    .map((p) => `${p.id},${p.name},${p.price},${p.stock},${p.category}`)
                    .join("\n")
                  const blob = new Blob([`ID,Name,Price,Stock,Category\n${csvData}`], { type: "text/csv" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = "products.csv"
                  a.click()
                }}
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
                📊 Export Products
              </button>
              <button
                onClick={fetchData}
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
                🔄 Refresh Data
              </button>
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
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                    }}
                  >
                    Product ID *
                  </label>
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
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                    }}
                  >
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e9ecef",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                      }}
                    >
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e9ecef",
                        borderRadius: "8px",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                      }}
                    >
                      Initial Stock *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct((prev) => ({
                          ...prev,
                          stock: e.target.value,
                        }))
                      }
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
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                    }}
                  >
                    Category *
                  </label>
                  <select
                    required
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
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
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                    }}
                  >
                    Description *
                  </label>
                  <textarea
                    required
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
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

  const generateInvoice = (order) => {
    const invoiceWindow = window.open("", "_blank")
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.id || "INV001"}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', 'Segoe UI', 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #1e293b; 
            background: #f8fafc; 
          }
          .invoice-container { 
            max-width: 900px; 
            margin: 2rem auto; 
            background: white; 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          
          /* Enhanced header with modern gradient and professional branding */
          .invoice-header { 
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%); 
            color: white; 
            padding: 40px; 
            position: relative;
            overflow: hidden;
          }
          .invoice-header::before {
            content: '';
            position: absolute;
            top: -50px;
            right: -50px;
            width: 200px;
            height: 200px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
          }
          .invoice-header::after {
            content: '';
            position: absolute;
            bottom: -30px;
            left: -30px;
            width: 150px;
            height: 150px;
            background: rgba(255,255,255,0.05);
            border-radius: 50%;
          }
          
          .company-info { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 30px; 
            position: relative;
            z-index: 2;
          }
          .company-logo { 
            display: flex;
            align-items: center;
            margin-bottom: 15px;
          }
          .logo-icon {
            width: 60px;
            height: 60px;
            background: rgba(255,255,255,0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            font-size: 28px;
          }
          .company-name {
            font-size: 2.8rem; 
            font-weight: 800; 
            letter-spacing: -0.02em;
            margin: 0;
          }
          .company-tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 500;
            margin: 5px 0 0 0;
          }
          .company-details {
            font-size: 14px;
            opacity: 0.8;
            line-height: 1.6;
            margin-top: 15px;
          }
          .company-details p {
            margin: 3px 0;
            display: flex;
            align-items: center;
          }
          .company-details span {
            margin-right: 8px;
          }
          
          .invoice-title-section {
            text-align: right;
            background: rgba(255,255,255,0.15);
            padding: 20px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
          }
          .invoice-title { 
            font-size: 2rem; 
            font-weight: 700;
            margin: 0 0 10px 0;
          }
          .invoice-meta {
            font-size: 14px;
            opacity: 0.9;
          }
          .invoice-meta p {
            margin: 5px 0;
          }
          
          /* Enhanced details section with better visual hierarchy */
          .invoice-details { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 30px; 
            padding: 40px; 
          }
          .customer-info, .invoice-info { 
            padding: 25px; 
            border-radius: 15px; 
            border: 1px solid #e2e8f0;
            position: relative;
          }
          .customer-info {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          }
          .invoice-info {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border-color: #a7f3d0;
          }
          .info-icon {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          }
          .customer-info .info-icon {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          }
          .invoice-info .info-icon {
            background: linear-gradient(135deg, #10b981, #059669);
          }
          .info-title { 
            font-weight: 700; 
            color: #1e293b; 
            margin-bottom: 20px; 
            font-size: 20px;
          }
          .info-content {
            line-height: 2.2;
            color: #475569;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: 600;
          }
          .info-value {
            font-family: monospace;
            background: rgba(226, 232, 240, 0.5);
            padding: 2px 8px;
            border-radius: 4px;
          }
          
          /* Enhanced table with modern styling */
          .items-section {
            padding: 0 40px 40px 40px;
          }
          .items-title {
            color: #1e293b;
            margin-bottom: 25px;
            font-size: 22px;
            font-weight: 700;
            display: flex;
            align-items: center;
          }
          .items-title::before {
            content: '🛒';
            margin-right: 10px;
            font-size: 24px;
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            border-radius: 15px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .items-table th { 
            padding: 20px; 
            text-align: left; 
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            font-weight: 700;
            font-size: 16px;
          }
          .items-table td { 
            padding: 18px; 
            border-bottom: 1px solid #e2e8f0;
            font-size: 15px;
          }
          .items-table tbody tr:nth-child(even) {
            background: #f8fafc;
          }
          .items-table tbody tr:hover {
            background: #f1f5f9;
          }
          .qty-badge {
            background: #e2e8f0;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 600;
          }
          
          /* Enhanced total section with premium styling */
          .total-section { 
            padding: 40px; 
            display: flex;
            justify-content: flex-end;
          }
          .total-container {
            min-width: 400px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 30px;
            border-radius: 20px;
            border: 2px solid #e2e8f0;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 15px;
            font-size: 16px;
            color: #475569;
          }
          .total-row span:first-child {
            font-weight: 600;
          }
          .total-row span:last-child {
            font-weight: 600;
          }
          .total-final { 
            border-top: 3px solid #3b82f6;
            padding-top: 20px;
            margin-top: 20px;
          }
          .total-final-content {
            display: flex;
            justify-content: space-between;
            font-size: 24px;
            font-weight: 800;
            color: #1e293b;
            background: white;
            padding: 20px;
            border-radius: 15px;
            border: 2px solid #3b82f6;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .total-final-content span:last-child {
            color: #3b82f6;
          }
          
          /* Enhanced footer with professional styling */
          .invoice-footer { 
            background: #f8fafc;
            padding: 40px; 
            text-align: center;
            border-top: 3px solid #e2e8f0;
          }
          .thank-you-section {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 30px;
            border-radius: 20px;
            margin-bottom: 30px;
            border: 2px solid #f59e0b;
            position: relative;
            overflow: hidden;
          }
          .thank-you-section::before {
            content: '';
            position: absolute;
            top: -20px;
            right: -20px;
            width: 100px;
            height: 100px;
            background: rgba(245, 158, 11, 0.1);
            border-radius: 50%;
          }
          .thank-you-icon {
            font-size: 48px;
            margin-bottom: 15px;
          }
          .thank-you-title {
            margin: 0 0 15px 0;
            font-size: 24px;
            font-weight: 800;
            color: #92400e;
          }
          .thank-you-text {
            margin: 0;
            font-size: 16px;
            color: #a16207;
            font-weight: 500;
            line-height: 1.6;
          }
          .footer-details {
            background: white;
            padding: 25px;
            border-radius: 15px;
            border: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
            line-height: 1.8;
          }
          .footer-details p {
            margin: 8px 0;
          }
          .footer-contact {
            font-weight: 600;
          }
          .footer-legal {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #94a3b8;
          }
          
          .print-btn { 
            background: linear-gradient(135deg, #10b981, #059669);
            color: white; 
            border: none; 
            padding: 15px 30px; 
            border-radius: 12px; 
            cursor: pointer; 
            margin: 15px 10px; 
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
          }
          .print-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
          }
          .close-btn {
            background: linear-gradient(135deg, #6b7280, #4b5563);
          }
          
          @media print { 
            .print-btn { display: none; } 
            body { background: white; }
            .invoice-container { box-shadow: none; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="company-info">
              <div>
                <div class="company-logo">
                  <div class="logo-icon">💳</div>
                  <div>
                    <h1 class="company-name">TIP TAP PAY</h1>
                    <p class="company-tagline">Smart Payment Solutions</p>
                  </div>
                </div>
                <div class="company-details">
                  <p><span>📧</span> support@tiptappay.com</p>
                  <p><span>📞</span> +91-9876-543-210</p>
                  <p><span>🏢</span> 123 Tech Street, Digital City, India - 110001</p>
                </div>
              </div>
              <div class="invoice-title-section">
                <h2 class="invoice-title">INVOICE</h2>
                <div class="invoice-meta">
                  <p><strong>Invoice #:</strong> INV-${order.id || "001"}</p>
                  <p><strong>Date:</strong> ${new Date(order.date || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="invoice-details">
            <div class="customer-info">
              <div class="info-icon">📋</div>
              <div class="info-title">Invoice Details</div>
              <div class="info-content">
                <div class="info-row">
                  <span class="info-label">Invoice #:</span>
                  <span class="info-value">INV-${order.id || "001"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Order ID:</span>
                  <span class="info-value">${order.id || "001"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span>${new Date(order.date || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div class="invoice-info">
              <div class="info-icon">💳</div>
              <div class="info-title">Payment Details</div>
              <div class="info-content">
                <div class="info-row">
                  <span class="info-label">Method:</span>
                  <span>${order.paymentMethod || "Card"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Transaction:</span>
                  <span class="info-value">TXN${Date.now()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status:</span>
                  <span style="color: #059669; font-weight: 700; background: #d1fae5; padding: 4px 12px; border-radius: 20px; font-size: 14px;">✅ ${(order.status || "COMPLETED").toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="items-section">
            <h3 class="items-title">Order Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: center;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${(order.items || [{ name: "Sample Product", quantity: 1, price: order.total || 299.99 }])
                  .map(
                    (item) => `
                  <tr>
                    <td style="font-weight: 600;">${item.name}</td>
                    <td style="text-align: center;"><span class="qty-badge">${item.quantity}</span></td>
                    <td style="text-align: center; font-weight: 500;">₹${item.price?.toFixed(2) || "0.00"}</td>
                    <td style="text-align: right; font-weight: 700; color: #1e293b;">₹${((item.quantity || 1) * (item.price || 0)).toFixed(2)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <div class="total-container">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${((order.total || 0) / 1.18).toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>GST (18%):</span>
                <span>₹${(((order.total || 0) * 0.18) / 1.18).toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Shipping:</span>
                <span style="color: #059669; font-weight: 700;">Free</span>
              </div>
              <div class="total-final">
                <div class="total-final-content">
                  <span>Total Amount:</span>
                  <span>₹${(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="invoice-footer">
            <div class="thank-you-section">
              <div class="thank-you-icon">🎉</div>
              <h3 class="thank-you-title">Thank You for Your Business!</h3>
              <p class="thank-you-text">
                Your order has been processed successfully. We appreciate your trust in Tip Tap Pay
                and look forward to serving you again!
              </p>
            </div>
            
            <div class="footer-details">
              <p class="footer-contact">📧 For support: support@tiptappay.com | 📞 +91-9876-543-210</p>
              <p>🌐 Visit us: www.tiptappay.com | Follow us on social media</p>
              <div class="footer-legal">
                <p>This is a computer-generated invoice. No signature required.</p>
                <p>Generated on ${new Date().toLocaleString()} | Invoice ID: INV-${order.id || "001"}</p>
              </div>
            </div>
          </div>

          <div style="text-align: center; padding: 20px;">
            <button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button>
            <button class="print-btn close-btn" onclick="window.close()">❌ Close</button>
          </div>
        </div>
      </body>
      </html>
    `

    invoiceWindow.document.write(invoiceHTML)
    invoiceWindow.document.close()
  }
}

export default AdminDashboard
