"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import html2pdf from "html2pdf.js"

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

  const handleDownloadPDF = () => {
    const element = document.getElementById("invoice-content")
    const opt = {
      margin: [1, 0.5, 1, 0.5], // Top, Right, Bottom, Left margins in inches
      filename: `invoice-${orderData.id}.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 1.5, // Reduced scale to prevent layout issues
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }, // Better page break handling
    }
    html2pdf().set(opt).from(element).save()
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
        <button onClick={handlePrint} className="nav-btn info">
          🖨️ Print Invoice
        </button>
        <button onClick={handleDownloadPDF} className="nav-btn accent">
          📄 Download PDF
        </button>
      </div>

      <div
        id="invoice-content"
        style={{
          background: "white",
          padding: "0",
          borderRadius: "0",
          boxShadow: "none", // Removed shadow for better PDF rendering
          marginBottom: "2rem",
          maxWidth: "800px", // Reduced width to fit better in PDF
          margin: "0 auto 2rem auto",
          fontFamily: "'Arial', 'Helvetica', sans-serif", // Using web-safe fonts for PDF
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          pageBreakInside: "avoid", // Prevent page breaks inside content
        }}
      >
        <div
          style={{
            background: "#1e40af", // Solid color instead of gradient for PDF compatibility
            color: "white",
            padding: "30px", // Reduced padding for better space utilization
            position: "relative",
            overflow: "hidden",
            pageBreakInside: "avoid", // Prevent page breaks in header
          }}
        >
          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px", // Reduced margin
                flexWrap: "wrap", // Allow wrapping on smaller screens
              }}
            >
              <div style={{ flex: "1", minWidth: "300px" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                  <div
                    style={{
                      width: "50px", // Reduced size
                      height: "50px",
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "8px", // Smaller border radius
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "15px",
                      fontSize: "24px", // Reduced font size
                    }}
                  >
                    💳
                  </div>
                  <div>
                    <h1 style={{ margin: "0", fontSize: "2.2rem", fontWeight: "bold", letterSpacing: "-0.01em" }}>
                      TIP TAP PAY
                    </h1>
                    <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: "0.9", fontWeight: "500" }}>
                      Smart Payment Solutions
                    </p>
                  </div>
                </div>
                <div style={{ fontSize: "13px", opacity: "0.9", lineHeight: "1.5" }}>
                  <p style={{ margin: "2px 0" }}>📧 support@tiptappay.com</p>
                  <p style={{ margin: "2px 0" }}>📞 +91-9876-543-210</p>
                  <p style={{ margin: "2px 0" }}>🏢 123 Tech Street, Digital City, India - 110001</p>
                </div>
              </div>

              <div style={{ textAlign: "right", minWidth: "200px" }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    padding: "15px", // Reduced padding
                    borderRadius: "10px",
                  }}
                >
                  <h2 style={{ margin: "0 0 8px 0", fontSize: "1.6rem", fontWeight: "bold" }}>INVOICE</h2>
                  <div style={{ fontSize: "13px", opacity: "0.9" }}>
                    <p style={{ margin: "3px 0" }}>
                      <strong>Invoice #:</strong> INV-{orderData.id}
                    </p>
                    <p style={{ margin: "3px 0" }}>
                      <strong>Date:</strong> {formatDate(orderData.date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "30px", pageBreakInside: "avoid" }}>
          {" "}
          {/* Reduced padding and added page break control */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px", // Reduced gap
              marginBottom: "30px",
              pageBreakInside: "avoid",
            }}
          >
            <div
              style={{
                background: "#f8fafc", // Solid color instead of gradient
                padding: "20px", // Reduced padding
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  width: "30px", // Reduced size
                  height: "30px",
                  background: "#3b82f6", // Solid color
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                }}
              >
                📋
              </div>
              <h3
                style={{
                  color: "#1e293b",
                  marginBottom: "15px",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                Invoice Details
              </h3>
              <div style={{ lineHeight: "1.8", color: "#475569", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontWeight: "600" }}>Invoice #:</span>
                  <span
                    style={{ fontFamily: "monospace", background: "#e2e8f0", padding: "2px 6px", borderRadius: "3px" }}
                  >
                    INV-{orderData.id}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontWeight: "600" }}>Order ID:</span>
                  <span
                    style={{ fontFamily: "monospace", background: "#e2e8f0", padding: "2px 6px", borderRadius: "3px" }}
                  >
                    {orderData.id}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "600" }}>Date:</span>
                  <span>{formatDate(orderData.date)}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#ecfdf5", // Solid color instead of gradient
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid #a7f3d0",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  width: "30px",
                  height: "30px",
                  background: "#10b981", // Solid color
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                }}
              >
                💳
              </div>
              <h3
                style={{
                  color: "#1e293b",
                  marginBottom: "15px",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                Payment Details
              </h3>
              <div style={{ lineHeight: "1.8", color: "#475569", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontWeight: "600" }}>Method:</span>
                  <span>{orderData.paymentMethod}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontWeight: "600" }}>Transaction:</span>
                  <span
                    style={{ fontFamily: "monospace", background: "#d1fae5", padding: "2px 6px", borderRadius: "3px" }}
                  >
                    {orderData.transactionId}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "600" }}>Status:</span>
                  <span
                    style={{
                      color: "#059669",
                      fontWeight: "bold",
                      background: "#d1fae5",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  >
                    ✅ {orderData.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: "30px", pageBreakInside: "avoid" }}>
            <h3
              style={{
                color: "#1e293b",
                marginBottom: "20px",
                fontSize: "20px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={{ marginRight: "8px", fontSize: "20px" }}>🛒</span>
              Order Items
            </h3>
            <div
              style={{
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                pageBreakInside: "avoid",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#1e293b", color: "white" }}>
                    <th
                      style={{
                        padding: "15px",
                        textAlign: "left",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      Product Name
                    </th>
                    <th
                      style={{
                        padding: "15px",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      Qty
                    </th>
                    <th
                      style={{
                        padding: "15px",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      Unit Price
                    </th>
                    <th
                      style={{
                        padding: "15px",
                        textAlign: "right",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.items.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        background: index % 2 === 0 ? "#f8fafc" : "white",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <td style={{ padding: "12px", fontWeight: "600", fontSize: "14px" }}>{item.name}</td>
                      <td style={{ padding: "12px", textAlign: "center", fontSize: "14px" }}>
                        <span
                          style={{
                            background: "#e2e8f0",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td style={{ padding: "12px", textAlign: "center", fontSize: "14px", fontWeight: "500" }}>
                        ₹{item.price.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          fontWeight: "bold",
                          fontSize: "14px",
                          color: "#1e293b",
                        }}
                      >
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "30px", pageBreakInside: "avoid" }}>
            <div style={{ minWidth: "350px" }}>
              {" "}
              {/* Reduced width */}
              <div
                style={{
                  background: "#f8fafc", // Solid color instead of gradient
                  padding: "25px",
                  borderRadius: "15px",
                  border: "2px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    fontSize: "15px",
                    color: "#475569",
                  }}
                >
                  <span style={{ fontWeight: "600" }}>Subtotal:</span>
                  <span style={{ fontWeight: "600" }}>₹{orderData.total.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    fontSize: "15px",
                    color: "#475569",
                  }}
                >
                  <span style={{ fontWeight: "600" }}>GST (18%):</span>
                  <span style={{ fontWeight: "600" }}>₹{orderData.tax.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "15px",
                    fontSize: "15px",
                    color: "#475569",
                  }}
                >
                  <span style={{ fontWeight: "600" }}>Shipping:</span>
                  <span style={{ color: "#059669", fontWeight: "bold" }}>Free</span>
                </div>
                <div
                  style={{
                    borderTop: "2px solid #3b82f6",
                    paddingTop: "15px",
                    marginTop: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "20px", // Reduced font size
                      fontWeight: "bold",
                      color: "#1e293b",
                      background: "white",
                      padding: "15px",
                      borderRadius: "10px",
                      border: "2px solid #3b82f6",
                    }}
                  >
                    <span>Total Amount:</span>
                    <span style={{ color: "#3b82f6" }}>₹{orderData.finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              paddingTop: "30px",
              borderTop: "2px solid #e2e8f0",
              pageBreakInside: "avoid",
            }}
          >
            <div
              style={{
                background: "#fef3c7", // Solid color instead of gradient
                padding: "25px",
                borderRadius: "15px",
                marginBottom: "25px",
                border: "2px solid #f59e0b",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🎉</div>
                <h3
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "20px", // Reduced font size
                    fontWeight: "bold",
                    color: "#92400e",
                  }}
                >
                  Thank You for Your Business!
                </h3>
                <p
                  style={{
                    margin: "0",
                    fontSize: "14px",
                    color: "#a16207",
                    fontWeight: "500",
                    lineHeight: "1.5",
                  }}
                >
                  Your order has been processed successfully. We appreciate your trust in Tip Tap Pay and look forward
                  to serving you again!
                </p>
              </div>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                pageBreakInside: "avoid",
              }}
            >
              <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6" }}>
                <p style={{ margin: "6px 0", fontWeight: "600" }}>
                  📧 For support: support@tiptappay.com | 📞 +91-9876-543-210
                </p>
                <p style={{ margin: "6px 0" }}>🌐 Visit us: www.tiptappay.com | Follow us on social media</p>
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                  <p style={{ margin: "4px 0", fontSize: "11px", color: "#94a3b8" }}>
                    This is a computer-generated invoice. No signature required.
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "11px", color: "#94a3b8" }}>
                    Generated on {new Date().toLocaleString()} | Invoice ID: INV-{orderData.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
      </div>
    </div>
  )
}

export default Invoice
