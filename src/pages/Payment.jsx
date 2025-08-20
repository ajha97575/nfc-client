"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../utils/CartContext.jsx"
import { createOrderWithStockValidation, validateBulkStock } from "../utils/productData.js"

const Payment = () => {
  const { items, getTotal, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi")
  const [paymentStatus, setPaymentStatus] = useState(null) // 'success', 'failed', null
  const [orderDetails, setOrderDetails] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [stockValidationError, setStockValidationError] = useState(null)
  const navigate = useNavigate()

  // Calculate total in INR (₹1 per product for now)
  const getTotalINR = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTaxINR = () => {
    return Math.round(getTotalINR() * 0.18) // 18% GST in India
  }

  const getFinalTotalINR = () => {
    return getTotalINR() + getTaxINR()
  }

  const validateStockBeforePayment = async () => {
    try {
      console.log("🔍 Validating stock before payment...")
      const stockItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }))

      const validation = await validateBulkStock(stockItems)

      if (validation.error) {
        console.error("Stock validation API error:", validation.error)
        setStockValidationError({
          message: validation.error,
          unavailableItems: validation.items || [],
        })
        return false
      }

      if (!validation.allAvailable) {
        const unavailableItems = validation.items?.filter((item) => !item.available) || []
        setStockValidationError({
          message: "Some items are no longer available in the requested quantities",
          unavailableItems,
        })
        return false
      }

      setStockValidationError(null)
      return true
    } catch (error) {
      console.error("Error validating stock:", error)
      setStockValidationError({
        message: "Unable to validate stock availability. Please try again.",
        unavailableItems: [],
      })
      return false
    }
  }

  const handleUPIPayment = async () => {
    const stockValid = await validateStockBeforePayment()
    if (!stockValid) {
      return
    }

    const totalAmount = getFinalTotalINR()
    const orderId = "ORD" + Date.now()
    const upiIntent = `upi://pay?pa=asinghvns99-2@okicici&pn=QR Scanner Store&am=${totalAmount}&tn=Order ${orderId}&cu=INR`

    console.log("🔗 UPI Intent URL:", upiIntent)

    setIsProcessing(true)
    setPaymentStatus(null)

    try {
      // Try to open UPI intent
      window.location.href = upiIntent

      // Show processing state
      setTimeout(() => {
        // Simulate payment verification
        showPaymentConfirmation(orderId, totalAmount)
      }, 3000)
    } catch (error) {
      console.error("Error opening UPI intent:", error)
      handlePaymentFailure("Unable to open UPI app. Please ensure you have a UPI app installed.")
    }
  }

  const showPaymentConfirmation = (orderId, amount) => {
    // Create a modal-like confirmation
    const confirmed = window.confirm(
      `🔔 Payment Confirmation\n\n` +
        `Order ID: ${orderId}\n` +
        `Amount: ₹${amount}\n\n` +
        `Did you complete the UPI payment successfully?\n\n` +
        `✅ Click OK if payment was successful\n` +
        `❌ Click Cancel if payment failed or was cancelled`,
    )

    if (confirmed) {
      handlePaymentSuccess(orderId)
    } else {
      handlePaymentFailure("Payment was cancelled or failed. Please try again.")
    }
  }

  const handleDemoPayment = async () => {
    const stockValid = await validateStockBeforePayment()
    if (!stockValid) {
      return
    }

    setIsProcessing(true)
    setPaymentStatus(null)

    // Simulate demo payment processing
    setTimeout(() => {
      const orderId = "DEMO" + Date.now()
      handlePaymentSuccess(orderId)
    }, 2000)
  }

  const handlePaymentSuccess = async (orderId) => {
    try {
      // Create order details
      const orderData = {
        id: orderId,
        items: [...items],
        total: getTotalINR(),
        tax: getTaxINR(),
        finalTotal: getFinalTotalINR(),
        paymentMethod: selectedPaymentMethod === "upi" ? "UPI Payment" : "Demo Payment",
        status: "completed",
        currency: "INR",
        transactionId: "TXN" + Date.now(),
        paymentTime: new Date().toISOString(),
      }

      console.log("💳 Processing payment with inventory management...")
      await createOrderWithStockValidation(orderData)

      // Store order details for invoice
      localStorage.setItem(
        "lastOrder",
        JSON.stringify({
          ...orderData,
          date: new Date().toISOString(),
        }),
      )

      // Set success state
      setPaymentStatus("success")
      setOrderDetails(orderData)
      setIsProcessing(false)

      // Clear cart after successful payment
      clearCart()

      // Auto redirect to invoice after 3 seconds
      setTimeout(() => {
        navigate("/invoice")
      }, 3000)
    } catch (error) {
      console.error("Error creating order:", error)

      if (error.message.includes("Insufficient stock") || error.message.includes("Stock changed")) {
        handlePaymentFailure(
          "Some items are no longer available. Your payment was not processed. Please update your cart and try again.",
        )
      } else {
        handlePaymentFailure("Error processing payment. Please contact support.")
      }
    }
  }

  const handlePaymentFailure = (message) => {
    setPaymentStatus("failed")
    setErrorMessage(message)
    setIsProcessing(false)
  }

  const retryPayment = () => {
    setPaymentStatus(null)
    setErrorMessage("")
    setStockValidationError(null)
    setIsProcessing(false)
  }

  const downloadInvoice = () => {
    navigate("/invoice")
  }

  if (stockValidationError) {
    return (
      <div className="container">
        <div className="header" style={{ background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)" }}>
          <h1>⚠️ Stock Unavailable</h1>
          <p>Some items in your cart are no longer available</p>
        </div>

        <div className="payment-container">
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              background: "#fff3cd",
              border: "2px solid #ffeaa7",
              borderRadius: "15px",
              marginBottom: "2rem",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📦</div>
            <h2 style={{ color: "#856404", marginBottom: "1rem" }}>Inventory Update Required</h2>
            <p style={{ color: "#856404", fontSize: "16px", marginBottom: "1rem" }}>{stockValidationError.message}</p>

            {stockValidationError.unavailableItems.length > 0 && (
              <div
                style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "10px",
                  margin: "1rem 0",
                  border: "1px solid #ffeaa7",
                }}
              >
                <h3 style={{ color: "#856404", marginBottom: "1rem" }}>Unavailable Items:</h3>
                <div style={{ textAlign: "left", maxWidth: "500px", margin: "0 auto" }}>
                  {stockValidationError.unavailableItems.map((item, index) => (
                    <div
                      key={index}
                      style={{ marginBottom: "0.5rem", padding: "0.5rem", background: "#f8f9fa", borderRadius: "5px" }}
                    >
                      <strong>{item.name}</strong>
                      <br />
                      <span style={{ fontSize: "14px", color: "#666" }}>
                        Requested: {item.requestedQuantity} | Available: {item.availableStock}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: "2rem" }}>
              <Link
                to="/cart"
                style={{
                  padding: "1rem 2rem",
                  background: "#ff9800",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  textDecoration: "none",
                  display: "inline-block",
                  marginRight: "1rem",
                  marginBottom: "1rem",
                }}
              >
                🛒 Update Cart
              </Link>

              <button
                onClick={retryPayment}
                style={{
                  padding: "1rem 2rem",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginBottom: "1rem",
                }}
              >
                🔄 Check Again
              </button>
            </div>

            <div
              style={{
                marginTop: "2rem",
                padding: "1rem",
                background: "#e3f2fd",
                border: "1px solid #bbdefb",
                borderRadius: "8px",
                color: "#0d47a1",
              }}
            >
              <h4>💡 What happened?</h4>
              <p style={{ margin: "0.5rem 0", fontSize: "14px" }}>
                Our real-time inventory system detected that some items in your cart are no longer available in the
                requested quantities. This prevents overselling and ensures accurate stock levels.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success Page
  if (paymentStatus === "success") {
    return (
      <div className="container">
        <div className="header" style={{ background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)" }}>
          <h1>✅ Payment Successful!</h1>
          <p>Your order has been confirmed and inventory updated</p>
        </div>

        <div className="payment-container">
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              background: "#d4edda",
              border: "2px solid #c3e6cb",
              borderRadius: "15px",
              marginBottom: "2rem",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
            <h2 style={{ color: "#155724", marginBottom: "1rem" }}>Payment Completed Successfully!</h2>
            <p style={{ color: "#155724", fontSize: "18px", marginBottom: "1rem" }}>
              Thank you for your order. Your payment has been processed and inventory has been updated in real-time.
            </p>

            {orderDetails && (
              <div
                style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "10px",
                  margin: "1rem 0",
                  border: "1px solid #c3e6cb",
                }}
              >
                <h3 style={{ color: "#155724", marginBottom: "1rem" }}>Order Details</h3>
                <div style={{ textAlign: "left", maxWidth: "400px", margin: "0 auto" }}>
                  <p>
                    <strong>Order ID:</strong> {orderDetails.id}
                  </p>
                  <p>
                    <strong>Transaction ID:</strong> {orderDetails.transactionId}
                  </p>
                  <p>
                    <strong>Amount Paid:</strong> ₹{orderDetails.finalTotal}
                  </p>
                  <p>
                    <strong>Payment Method:</strong> {orderDetails.paymentMethod}
                  </p>
                  <p>
                    <strong>Items:</strong> {orderDetails.items.length} items
                  </p>
                  <p>
                    <strong>Status:</strong> ✅ Confirmed & Stock Updated
                  </p>
                </div>
              </div>
            )}

            <div style={{ marginTop: "2rem" }}>
              <button
                onClick={downloadInvoice}
                style={{
                  padding: "1rem 2rem",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginRight: "1rem",
                  marginBottom: "1rem",
                }}
              >
                📄 Download Invoice
              </button>

              <Link
                to="/scanner"
                style={{
                  padding: "1rem 2rem",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  textDecoration: "none",
                  display: "inline-block",
                  marginBottom: "1rem",
                }}
              >
                🛒 Continue Shopping
              </Link>
            </div>

            <p style={{ fontSize: "14px", color: "#666", marginTop: "1rem" }}>
              Redirecting to invoice page in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Failure Page
  if (paymentStatus === "failed") {
    return (
      <div className="container">
        <div className="header" style={{ background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)" }}>
          <h1>❌ Payment Failed</h1>
          <p>There was an issue with your payment</p>
        </div>

        <div className="payment-container">
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              background: "#f8d7da",
              border: "2px solid #f5c6cb",
              borderRadius: "15px",
              marginBottom: "2rem",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>😞</div>
            <h2 style={{ color: "#721c24", marginBottom: "1rem" }}>Payment Could Not Be Processed</h2>
            <p style={{ color: "#721c24", fontSize: "16px", marginBottom: "1rem" }}>{errorMessage}</p>

            <div
              style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "10px",
                margin: "1rem 0",
                border: "1px solid #f5c6cb",
              }}
            >
              <h3 style={{ color: "#721c24", marginBottom: "1rem" }}>What went wrong?</h3>
              <ul style={{ textAlign: "left", color: "#721c24", maxWidth: "400px", margin: "0 auto" }}>
                <li>UPI app may not be installed</li>
                <li>Insufficient balance in account</li>
                <li>Network connectivity issues</li>
                <li>Payment was cancelled by user</li>
                <li>UPI PIN entered incorrectly</li>
              </ul>
            </div>

            <div style={{ marginTop: "2rem" }}>
              <button
                onClick={retryPayment}
                style={{
                  padding: "1rem 2rem",
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginRight: "1rem",
                  marginBottom: "1rem",
                }}
              >
                🔄 Retry Payment
              </button>

              <Link
                to="/cart"
                style={{
                  padding: "1rem 2rem",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  textDecoration: "none",
                  display: "inline-block",
                  marginBottom: "1rem",
                }}
              >
                🛒 Back to Cart
              </Link>
            </div>

            <div
              style={{
                marginTop: "2rem",
                padding: "1rem",
                background: "#fff3cd",
                border: "1px solid #ffeaa7",
                borderRadius: "8px",
                color: "#856404",
              }}
            >
              <h4>💡 Try These Solutions:</h4>
              <ul style={{ textAlign: "left", margin: "0.5rem 0" }}>
                <li>Check your internet connection</li>
                <li>Ensure UPI app is installed and working</li>
                <li>Verify sufficient account balance</li>
                <li>Try demo payment for testing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Regular Payment Page (if no items)
  if (items.length === 0) {
    return (
      <div className="container">
        <div className="header">
          <h1>Payment</h1>
        </div>
        <div className="nav-buttons">
          <Link to="/" className="nav-btn secondary">
            ← Back to Home
          </Link>
          <Link to="/scanner" className="nav-btn">
            🛒 Start Shopping
          </Link>
        </div>
        <div className="payment-container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h3>🛒 No items in cart</h3>
            <p>Please add items before checkout.</p>
            <Link to="/scanner" className="nav-btn" style={{ marginTop: "1rem" }}>
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Regular Payment Page
  return (
    <div className="container">
      <div className="header">
        <h1>Payment</h1>
        <p>Review your order and complete payment</p>
      </div>

      <div className="nav-buttons">
        <Link to="/" className="nav-btn secondary">
          ← Back to Home
        </Link>
        <Link to="/cart" className="nav-btn secondary">
          ← Back to Cart
        </Link>
      </div>

      <div className="payment-container">
        <div className="payment-summary">
          <h3>📋 Order Summary</h3>

          {items.map((item) => (
            <div key={item.id} className="payment-item">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="payment-item">
            <span>Subtotal</span>
            <span>₹{getTotalINR().toFixed(2)}</span>
          </div>

          <div className="payment-item">
            <span>GST (18%)</span>
            <span>₹{getTaxINR().toFixed(2)}</span>
          </div>

          <div className="payment-item">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className="payment-item payment-total">
            <span>Total</span>
            <span>₹{getFinalTotalINR().toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div style={{ marginBottom: "2rem" }}>
          <h3>💳 Select Payment Method</h3>

          {/* UPI Payment Option */}
          <div
            style={{
              padding: "1rem",
              border: selectedPaymentMethod === "upi" ? "2px solid #4CAF50" : "2px solid #ddd",
              borderRadius: "10px",
              background: selectedPaymentMethod === "upi" ? "#f8fff8" : "#f8f9fa",
              marginBottom: "1rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => setSelectedPaymentMethod("upi")}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={selectedPaymentMethod === "upi"}
                onChange={() => setSelectedPaymentMethod("upi")}
                style={{ marginRight: "0.5rem" }}
              />
              <strong>📱 UPI Payment (Recommended)</strong>
            </div>
            <p style={{ fontSize: "14px", color: "#666", margin: "0", paddingLeft: "1.5rem" }}>
              Pay securely using any UPI app (PhonePe, Google Pay, Paytm, etc.)
            </p>
            <p style={{ fontSize: "12px", color: "#888", margin: "0.5rem 0 0 1.5rem" }}>
              UPI ID: asinghvns99-2@okicici | Amount: ₹{getFinalTotalINR()}
            </p>
          </div>

          {/* Demo Payment Option */}
          <div
            style={{
              padding: "1rem",
              border: selectedPaymentMethod === "demo" ? "2px solid #2196F3" : "2px solid #ddd",
              borderRadius: "10px",
              background: selectedPaymentMethod === "demo" ? "#f8fbff" : "#f8f9fa",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => setSelectedPaymentMethod("demo")}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                type="radio"
                name="paymentMethod"
                value="demo"
                checked={selectedPaymentMethod === "demo"}
                onChange={() => setSelectedPaymentMethod("demo")}
                style={{ marginRight: "0.5rem" }}
              />
              <strong>🧪 Demo Payment</strong>
            </div>
            <p style={{ fontSize: "14px", color: "#666", margin: "0", paddingLeft: "1.5rem" }}>
              For testing purposes only - No real payment will be processed
            </p>
          </div>
        </div>

        {/* Payment Button */}
        {selectedPaymentMethod === "upi" ? (
          <button
            className="pay-btn"
            onClick={handleUPIPayment}
            disabled={isProcessing}
            style={{
              opacity: isProcessing ? 0.7 : 1,
              cursor: isProcessing ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
            }}
          >
            {isProcessing ? "🔄 Processing UPI Payment..." : `📱 Pay ₹${getFinalTotalINR()} via UPI`}
          </button>
        ) : (
          <button
            className="pay-btn"
            onClick={handleDemoPayment}
            disabled={isProcessing}
            style={{
              opacity: isProcessing ? 0.7 : 1,
              cursor: isProcessing ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
            }}
          >
            {isProcessing ? "🔄 Processing Demo Payment..." : `🧪 Demo Pay ₹${getFinalTotalINR()}`}
          </button>
        )}

        {isProcessing && (
          <div style={{ textAlign: "center", marginTop: "1rem", color: "#666" }}>
            {selectedPaymentMethod === "upi" ? (
              <div>
                <p>📱 Opening your UPI app...</p>
                <p>Complete the payment and return to this page</p>
                <p style={{ fontSize: "12px", color: "#888" }}>
                  If UPI app doesn't open, please ensure you have a UPI app installed
                </p>
              </div>
            ) : (
              <div>
                <p>Please wait while we process your payment...</p>
                <p>🔄 This may take a few seconds</p>
              </div>
            )}
          </div>
        )}

        {/* UPI Instructions */}
        {selectedPaymentMethod === "upi" && !isProcessing && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#e8f5e8",
              border: "1px solid #c3e6cb",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#155724" }}>📱 UPI Payment Instructions:</h4>
            <ol style={{ margin: "0", paddingLeft: "1.5rem", color: "#155724" }}>
              <li>Click the "Pay via UPI" button above</li>
              <li>Your UPI app will open automatically</li>
              <li>Verify the payment details (Amount: ₹{getFinalTotalINR()})</li>
              <li>Enter your UPI PIN to complete payment</li>
              <li>Return to this page after payment</li>
              <li>Confirm payment status when prompted</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

export default Payment
