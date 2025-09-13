"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getAllOrders, getOrderById, cancelOrderAndRestoreStock } from "../utils/productData.js"

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    document.title = "Orders - Tip Tap Pay"
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const ordersData = await getAllOrders()
      setOrders(ordersData || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to load orders. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = async (orderId) => {
    try {
      const orderDetails = await getOrderById(orderId)
      setSelectedOrder(orderDetails)
    } catch (err) {
      console.error("Error fetching order details:", err)
      alert("Failed to load order details")
    }
  }

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? This will restore the stock for all items in the order.",
    )

    if (!confirmed) return

    try {
      setIsProcessing(true)
      await cancelOrderAndRestoreStock(orderId)

      // Refresh orders list
      await fetchOrders()

      // Close order details if it's the cancelled order
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null)
      }

      alert("Order cancelled successfully and stock has been restored.")
    } catch (err) {
      console.error("Error cancelling order:", err)
      alert("Failed to cancel order. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const generateInvoice = (order) => {
    // Store order data in localStorage for invoice page
    localStorage.setItem(
      "lastOrder",
      JSON.stringify({
        ...order,
        transactionId: order.transactionId || `TXN${Date.now()}`,
        tax: order.total * 0.18,
        finalTotal: order.total + order.total * 0.18,
        status: order.status || "completed",
      }),
    )
    // Navigate to invoice page
    window.open("/invoice", "_blank")
  }

  const filteredAndSortedOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date) - new Date(a.date)
        case "oldest":
          return new Date(a.date) - new Date(b.date)
        case "amount-high":
          return b.total - a.total
        case "amount-low":
          return a.total - b.total
        default:
          return 0
      }
    })

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#28a745"
      case "pending":
        return "#ffc107"
      case "cancelled":
        return "#dc3545"
      default:
        return "#6c757d"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✅"
      case "pending":
        return "⏳"
      case "cancelled":
        return "❌"
      default:
        return "📦"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>Order Management</h1>
          <p>Loading your orders...</p>
        </div>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔄</div>
          <p>Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="header">
          <h1>Order Management</h1>
          <p>Error loading orders</p>
        </div>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
          <p style={{ color: "#dc3545", marginBottom: "1rem" }}>{error}</p>
          <button
            onClick={fetchOrders}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Order Management</h1>
        <p>Track and manage your orders</p>
      </div>

      <div className="nav-buttons">
        <Link to="/" className="nav-btn secondary">
          ← Back to Home
        </Link>
        <Link to="/scanner" className="nav-btn">
          🛒 Continue Shopping
        </Link>
      </div>

      {/* Filters and Search */}
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
              Search Orders
            </label>
            <input
              type="text"
              placeholder="Search by order ID or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #e9ecef",
                borderRadius: "8px",
                fontSize: "14px",
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
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #e9ecef",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              <option value="all">All Orders</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
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
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #e9ecef",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Highest Amount</option>
              <option value="amount-low">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
            color: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {orders.filter((o) => o.status === "completed").length}
          </div>
          <div>Completed Orders</div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)",
            color: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {orders.filter((o) => o.status === "pending").length}
          </div>
          <div>Pending Orders</div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
            color: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>❌</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {orders.filter((o) => o.status === "cancelled").length}
          </div>
          <div>Cancelled Orders</div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
            color: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💰</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            ₹{orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}
          </div>
          <div>Total Revenue</div>
        </div>
      </div>

      {/* Orders List */}
      {filteredAndSortedOrders.length === 0 ? (
        <div
          style={{
            background: "white",
            padding: "3rem",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
          <h3>No Orders Found</h3>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            {searchTerm || statusFilter !== "all"
              ? "No orders match your current filters."
              : "You haven't placed any orders yet."}
          </p>
          <Link
            to="/scanner"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              display: "inline-block",
            }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "1rem",
          }}
        >
          {filteredAndSortedOrders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                border: "1px solid #e9ecef",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>Order #{order.id}</h3>
                  <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>{formatDate(order.date)}</p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 1rem",
                      background: getStatusColor(order.status),
                      color: "white",
                      borderRadius: "20px",
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {getStatusIcon(order.status)} {order.status.toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    ₹{order.total?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <strong>Items ({order.items?.length || 0}):</strong>
                <div style={{ marginTop: "0.5rem" }}>
                  {order.items?.slice(0, 3).map((item, index) => (
                    <span
                      key={index}
                      style={{
                        display: "inline-block",
                        background: "#f8f9fa",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "12px",
                        marginRight: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {item.name} x{item.quantity}
                    </span>
                  ))}
                  {order.items?.length > 3 && (
                    <span
                      style={{
                        display: "inline-block",
                        background: "#e9ecef",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                {order.status === "completed" && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={isProcessing}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                  >
                    Cancel Order
                  </button>
                )}

                <button
                  onClick={() => generateInvoice(order)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  📄 Download Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
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
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 style={{ margin: 0 }}>Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <strong>Order ID:</strong>
                  <br />
                  {selectedOrder.id}
                </div>
                <div>
                  <strong>Date:</strong>
                  <br />
                  {formatDate(selectedOrder.date)}
                </div>
                <div>
                  <strong>Status:</strong>
                  <br />
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      color: getStatusColor(selectedOrder.status),
                      fontWeight: "600",
                    }}
                  >
                    {getStatusIcon(selectedOrder.status)} {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <strong>Total:</strong>
                  <br />₹{selectedOrder.total?.toFixed(2) || "0.00"}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <h3>Order Items</h3>
              <div
                style={{
                  border: "1px solid #e9ecef",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {selectedOrder.items?.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem",
                      borderBottom: index < selectedOrder.items.length - 1 ? "1px solid #e9ecef" : "none",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600" }}>{item.name}</div>
                      <div style={{ fontSize: "14px", color: "#666" }}>
                        ₹{item.price} × {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: "600" }}>₹{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>

              {selectedOrder.status === "completed" && (
                <button
                  onClick={() => {
                    handleCancelOrder(selectedOrder.id)
                    setSelectedOrder(null)
                  }}
                  disabled={isProcessing}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    opacity: isProcessing ? 0.6 : 1,
                  }}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
