"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import html2pdf from "html2pdf.js";

const Invoice = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const lastOrder = localStorage.getItem("lastOrder");
    if (lastOrder) {
      try {
        const parsedOrder = JSON.parse(lastOrder);
        setOrderData(parsedOrder);
      } catch (error) {
        console.error("Error parsing order data:", error);
      }
    }
    setLoading(false);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("invoice-content");
    const opt = {
      margin: 0.5,
      filename: `invoice-${orderData.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

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
    );
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
    );
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
        <button onClick={handleDownloadPDF} className="nav-btn accent">
          📄 Download PDF
        </button>
      </div>

      <div
        id="invoice-content"
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "0",
          boxShadow: "0 0 20px rgba(0,0,0,0.1)",
          marginBottom: "2rem",
          maxWidth: "800px",
          margin: "0 auto 2rem auto",
          fontFamily: "'Arial', sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
            paddingBottom: "20px",
            borderBottom: "3px solid #2563eb",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "white",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <h1 style={{ margin: "0", fontSize: "2.5rem", fontWeight: "bold" }}>
              TIP TAP PAY
            </h1>
            <p
              style={{ margin: "10px 0 0 0", fontSize: "18px", opacity: "0.9" }}
            >
              Modern NFC & QR Code Shopping Experience
            </p>
          </div>
          <div style={{ color: "#6b7280", fontSize: "14px" }}>
            <p style={{ margin: "5px 0" }}>
              📧 support@tiptappay.com | 📞 +91-9876-543-210
            </p>
            <p style={{ margin: "5px 0" }}>
              🏢 123 Tech Street, Digital City, India - 110001
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              background: "#f8fafc",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                color: "#1e293b",
                marginBottom: "15px",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              📋 Invoice Details
            </h3>
            <div style={{ lineHeight: "2", color: "#475569" }}>
              <p
                style={{
                  margin: "8px 0",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <strong>Invoice #:</strong> <span>INV-{orderData.id}</span>
              </p>
              <p
                style={{
                  margin: "8px 0",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <strong>Order ID:</strong> <span>{orderData.id}</span>
              </p>
              <p
                style={{
                  margin: "8px 0",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <strong>Date:</strong> <span>{formatDate(orderData.date)}</span>
              </p>
            </div>
          </div>

          <div
            style={{
              background: "#f0f9ff",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid #bae6fd",
            }}
          >
            <h3
              style={{
                color: "#1e293b",
                marginBottom: "15px",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              💳 Payment Details
            </h3>
            <div style={{ lineHeight: "2", color: "#475569" }}>
              <p
                style={{
                  margin: "8px 0",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <strong>Method:</strong> <span>{orderData.paymentMethod}</span>
              </p>
              <p
                style={{
                  margin: "8px 0",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <strong>Transaction:</strong>{" "}
                <span>{orderData.transactionId}</span>
              </p>
              <p
                style={{
                  margin: "8px 0",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <strong>Status:</strong>
                <span style={{ color: "#059669", fontWeight: "600" }}>
                  ✅ {orderData.status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h3
            style={{
              color: "#1e293b",
              marginBottom: "20px",
              fontSize: "20px",
              fontWeight: "600",
            }}
          >
            🛒 Order Items
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ background: "#1e293b", color: "white" }}>
                <th
                  style={{
                    padding: "15px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Product Name
                </th>
                <th
                  style={{
                    padding: "15px",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  Qty
                </th>
                <th
                  style={{
                    padding: "15px",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  Unit Price
                </th>
                <th
                  style={{
                    padding: "15px",
                    textAlign: "right",
                    fontWeight: "600",
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
                  <td style={{ padding: "15px", fontWeight: "500" }}>
                    {item.name}
                  </td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "15px",
                      textAlign: "right",
                      fontWeight: "600",
                    }}
                  >
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "40px",
          }}
        >
          <div style={{ minWidth: "350px" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                padding: "25px",
                borderRadius: "15px",
                border: "2px solid #cbd5e1",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  fontSize: "16px",
                  color: "#475569",
                }}
              >
                <span>Subtotal:</span>
                <span>₹{orderData.total.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  fontSize: "16px",
                  color: "#475569",
                }}
              >
                <span>GST (18%):</span>
                <span>₹{orderData.tax.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                  fontSize: "16px",
                  color: "#475569",
                }}
              >
                <span>Shipping:</span>
                <span style={{ color: "#059669", fontWeight: "600" }}>
                  Free
                </span>
              </div>
              <hr style={{ margin: "15px 0", border: "2px solid #94a3b8" }} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#1e293b",
                  background: "white",
                  padding: "15px",
                  borderRadius: "10px",
                  border: "2px solid #2563eb",
                }}
              >
                <span>Total Amount:</span>
                <span style={{ color: "#2563eb" }}>
                  ₹{orderData.finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            paddingTop: "30px",
            borderTop: "2px solid #e2e8f0",
            color: "#6b7280",
          }}
        >
          <div
            style={{
              background: "#fef3c7",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
              border: "1px solid #fbbf24",
            }}
          >
            <p
              style={{
                margin: "0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#92400e",
              }}
            >
              🎉 Thank you for shopping with Tip Tap Pay!
            </p>
            <p
              style={{
                margin: "10px 0 0 0",
                fontSize: "14px",
                color: "#a16207",
              }}
            >
              Your order has been processed successfully. We appreciate your
              business!
            </p>
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af" }}>
            <p style={{ margin: "5px 0" }}>
              For any queries, please contact us at support@tiptappay.com
            </p>
            <p style={{ margin: "5px 0" }}>
              This is a computer-generated invoice. No signature required.
            </p>
            <p style={{ margin: "5px 0" }}>
              Generated on {new Date().toLocaleString()}
            </p>
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
  );
};

export default Invoice;
