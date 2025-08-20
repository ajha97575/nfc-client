"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

const Invoice = () => {
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const lastOrder = localStorage.getItem("lastOrder")
    if (lastOrder) {
      try {
        const parsedOrder = JSON.parse(lastOrder)
        setOrderData(parsedOrder)
      } catch (error) {
        console.error("Error parsing order data:", error)
      }
    }
    setLoading(false)
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const invoiceContent = `
INVOICE - TIP TAP PAY
=====================

Order ID: ${orderData.id}
Transaction ID: ${orderData.transactionId}
Date: ${formatDate(orderData.date)}
Payment Method: ${orderData.paymentMethod}

ITEMS:
------
${orderData.items.map((item) => `${item.name} x ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`).join("\n")}

SUMMARY:
--------
Subtotal: ₹${orderData.total.toFixed(2)}
GST (18%): ₹${orderData.tax.toFixed(2)}
Total: ₹${orderData.finalTotal.toFixed(2)}

Status: ${orderData.status.toUpperCase()}

Thank you for your business!
    `

    const blob = new Blob([invoiceContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoice-${orderData.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>📄 Invoice</h1>
          <p>Loading your invoice...</p>
        </div>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔄</div>
          <p>Loading invoice details...</p>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="container">
        <div className="header">
          <h1>📄 Invoice</h1>
          <p>No invoice data found</p>
        </div>

        <div className="nav-buttons">
          <Link to="/" className="nav-btn secondary">
            ← Back to Home
          </Link>
          <Link to="/orders" className="nav-btn">
            📦 View Orders
          </Link>
        </div>

        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
          <h3>No Invoice Found</h3>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            No recent order data found. Please complete a purchase first.
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
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>📄 Invoice</h1>
        <p>Order #{orderData.id}</p>
      </div>

      <div className="nav-buttons">
        <Link to="/" className="nav-btn secondary">
          ← Back to Home
        </Link>
        <Link to="/orders" className="nav-btn secondary">
          📦 All Orders
        </Link>
        <button onClick={handlePrint} className="nav-btn info">
          🖨️ Print Invoice
        </button>
        <button onClick={handleDownload} className="nav-btn accent">
          💾 Download Invoice
        </button>
      </div>

      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          marginBottom: "2rem",
          border: "1px solid #e9ecef",
        }}
      >
        {/* Company Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            paddingBottom: "1rem",
            borderBottom: "2px solid #007bff",
          }}
        >
          <h1 style={{ color: "#007bff", margin: "0 0 0.5rem 0", fontSize: "2rem" }}>🚀 TIP TAP PAY</h1>
          <p style={{ margin: "0", color: "#666", fontSize: "16px" }}>Modern NFC & QR Code Shopping Experience</p>
          <p style={{ margin: "0.5rem 0 0 0", color: "#888", fontSize: "14px" }}>
            Email: support@tiptappay.com | Phone: +91-XXXX-XXXX-XX
          </p>
        </div>

        {/* Invoice Details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h3 style={{ color: "#333", marginBottom: "1rem", fontSize: "1.25rem" }}>📋 Invoice Details</h3>
            <div style={{ lineHeight: "1.8", color: "#666" }}>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Invoice #:</strong> INV-{orderData.id}
              </p>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Order ID:</strong> {orderData.id}
              </p>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Transaction ID:</strong> {orderData.transactionId}
              </p>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Date:</strong> {formatDate(orderData.date)}
              </p>
            </div>
          </div>

          <div>
            <h3 style={{ color: "#333", marginBottom: "1rem", fontSize: "1.25rem" }}>💳 Payment Details</h3>
            <div style={{ lineHeight: "1.8", color: "#666" }}>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Payment Method:</strong> {orderData.paymentMethod}
              </p>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Currency:</strong> {orderData.currency || "INR"}
              </p>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color: orderData.status === "completed" ? "#28a745" : "#ffc107",
                    fontWeight: "600",
                  }}
                >
                  ✅ {orderData.status.toUpperCase()}
                </span>
              </p>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Payment Time:</strong> {formatDate(orderData.paymentTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: "#333", marginBottom: "1rem", fontSize: "1.25rem" }}>🛒 Order Items</h3>
          <div
            style={{
              border: "1px solid #e9ecef",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                gap: "1rem",
                padding: "1rem",
                background: "#f8f9fa",
                fontWeight: "600",
                borderBottom: "1px solid #e9ecef",
              }}
            >
              <div>Product Name</div>
              <div style={{ textAlign: "center" }}>Quantity</div>
              <div style={{ textAlign: "center" }}>Unit Price</div>
              <div style={{ textAlign: "right" }}>Total</div>
            </div>

            {/* Table Rows */}
            {orderData.items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  gap: "1rem",
                  padding: "1rem",
                  borderBottom: index < orderData.items.length - 1 ? "1px solid #e9ecef" : "none",
                  background: index % 2 === 0 ? "white" : "#f8f9fa",
                }}
              >
                <div style={{ fontWeight: "500" }}>{item.name}</div>
                <div style={{ textAlign: "center" }}>{item.quantity}</div>
                <div style={{ textAlign: "center" }}>₹{item.price.toFixed(2)}</div>
                <div style={{ textAlign: "right", fontWeight: "600" }}>₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "2rem",
          }}
        >
          <div style={{ minWidth: "300px" }}>
            <div
              style={{
                padding: "1rem",
                background: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e9ecef",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  fontSize: "16px",
                }}
              >
                <span>Subtotal:</span>
                <span>₹{orderData.total.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  fontSize: "16px",
                }}
              >
                <span>GST (18%):</span>
                <span>₹{orderData.tax.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  fontSize: "16px",
                }}
              >
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <hr style={{ margin: "0.75rem 0", border: "1px solid #dee2e6" }} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "#007bff",
                }}
              >
                <span>Total Amount:</span>
                <span>₹{orderData.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            paddingTop: "1rem",
            borderTop: "1px solid #e9ecef",
            color: "#666",
            fontSize: "14px",
          }}
        >
          <p style={{ margin: "0.5rem 0" }}>
            <strong>Thank you for shopping with Tip Tap Pay!</strong>
          </p>
          <p style={{ margin: "0.5rem 0" }}>For any queries, please contact us at support@tiptappay.com</p>
          <p style={{ margin: "0.5rem 0", fontSize: "12px", color: "#888" }}>
            This is a computer-generated invoice. No signature required.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <Link
          to="/scanner"
          style={{
            padding: "1rem 2rem",
            background: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            display: "inline-block",
          }}
        >
          🛒 Continue Shopping
        </Link>

        <Link
          to="/orders"
          style={{
            padding: "1rem 2rem",
            background: "#28a745",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            display: "inline-block",
          }}
        >
          📦 View All Orders
        </Link>
      </div>
    </div>
  )
}

export default Invoice
