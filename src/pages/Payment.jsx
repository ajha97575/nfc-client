"use client"

import { useState, useEffect } from "react"
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
  const [customerEmail, setCustomerEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [showEmailSuccessModal, setShowEmailSuccessModal] = useState(false)
  const navigate = useNavigate()

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e) => {
    const email = e.target.value
    setCustomerEmail(email)

    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("")
    }
  }

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

  const validateEmailBeforePayment = () => {
    if (!customerEmail) {
      setEmailError("Email is required for invoice")
      return false
    }
    if (!validateEmail(customerEmail)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    return true
  }

  const handleUPIPayment = async () => {
    if (!validateEmailBeforePayment()) {
      return
    }

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
      window.location.href = upiIntent

      setTimeout(() => {
        showPaymentConfirmation(orderId, totalAmount)
      }, 3000)
    } catch (error) {
      console.error("Error opening UPI intent:", error)
      handlePaymentFailure("Unable to open UPI app. Please ensure you have a UPI app installed.")
    }
  }

  const showPaymentConfirmation = (orderId, amount) => {
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
    if (!validateEmailBeforePayment()) {
      return
    }

    const stockValid = await validateStockBeforePayment()
    if (!stockValid) {
      return
    }

    setIsProcessing(true)
    setPaymentStatus(null)

    setTimeout(() => {
      const orderId = "DEMO" + Date.now()
      handlePaymentSuccess(orderId)
    }, 2000)
  }

  const handleRazorpayPayment = async () => {
    if (!validateEmailBeforePayment()) {
      return
    }

    const stockValid = await validateStockBeforePayment()
    if (!stockValid) {
      return
    }

    setIsProcessing(true)
    setPaymentStatus(null)

    try {
      const response = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: getFinalTotalINR(),
          currency: "INR",
          receipt: "order_" + Date.now(),
        }),
      })

      const orderData = await response.json()

      if (!response.ok) {
        throw new Error(orderData.error || "Failed to create order")
      }

      const options = {
        key: "rzp_test_RH0I6LBnmc0Ziz",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "QR Scanner Store",
        description: "Payment for your order",
        order_id: orderData.id,
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("http://localhost:5000/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok && verifyData.success) {
              handlePaymentSuccess("RZP" + Date.now(), response.razorpay_payment_id)
            } else {
              handlePaymentFailure("Payment verification failed. Please contact support.")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            handlePaymentFailure("Payment verification failed. Please contact support.")
          }
        },
        prefill: {
          name: "Customer",
          email: customerEmail,
          contact: "9999999999",
        },
        theme: {
          color: "#4CAF50",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            handlePaymentFailure("Payment was cancelled by user.")
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error("Razorpay payment error:", error)
      handlePaymentFailure("Failed to initialize payment. Please try again.")
    }
  }

  const handlePaymentSuccess = async (orderId, transactionId = null) => {
    try {
      const orderData = {
        id: orderId,
        items: [...items],
        total: getTotalINR(),
        tax: getTaxINR(),
        finalTotal: getFinalTotalINR(),
        paymentMethod:
          selectedPaymentMethod === "upi"
            ? "UPI Payment"
            : selectedPaymentMethod === "demo"
              ? "Demo Payment"
              : "Razorpay",
        status: "completed",
        currency: "INR",
        transactionId: transactionId || "TXN" + Date.now(),
        paymentTime: new Date().toISOString(),
        customerEmail: customerEmail,
      }

      console.log("💳 Processing payment with inventory management...")
      await createOrderWithStockValidation(orderData)

      try {
        const emailResponse = await fetch("http://localhost:5000/api/payment/send-invoice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: customerEmail,
            orderData: orderData,
          }),
        })

        if (emailResponse.ok) {
          console.log("📧 Invoice email sent successfully")
          setShowEmailSuccessModal(true)
        } else {
          console.log("⚠️ Failed to send invoice email, but payment was successful")
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError)
      }

      localStorage.setItem(
        "lastOrder",
        JSON.stringify({
          ...orderData,
          date: new Date().toISOString(),
        }),
      )

      setPaymentStatus("success")
      setOrderDetails(orderData)
      setIsProcessing(false)

      clearCart()

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

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowEmailSuccessModal(false)
    }
  }

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (showEmailSuccessModal) {
      const timer = setTimeout(() => {
        setShowEmailSuccessModal(false)
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [showEmailSuccessModal])

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
        <div style={{ marginBottom: "2rem" }}>
          <h3>📧 Customer Information</h3>
          <div
            style={{
              padding: "1rem",
              border: "2px solid #ddd",
              borderRadius: "10px",
              background: "#f8f9fa",
              marginBottom: "1rem",
            }}
          >
            <label
              htmlFor="customerEmail"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Email Address (Required for Invoice)
            </label>
            <input
              type="email"
              id="customerEmail"
              value={customerEmail}
              onChange={handleEmailChange}
              placeholder="Enter your email address"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: emailError ? "2px solid #dc3545" : "1px solid #ccc",
                borderRadius: "5px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
              required
            />
            {emailError && (
              <p
                style={{
                  color: "#dc3545",
                  fontSize: "14px",
                  margin: "0.5rem 0 0 0",
                }}
              >
                {emailError}
              </p>
            )}
            <p
              style={{
                fontSize: "12px",
                color: "#666",
                margin: "0.5rem 0 0 0",
              }}
            >
              We'll send your invoice and order confirmation to this email address
            </p>
          </div>
        </div>

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

        <div style={{ marginBottom: "2rem" }}>
          <h3>💳 Select Payment Method</h3>

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

          <div
            style={{
              padding: "1rem",
              border: selectedPaymentMethod === "demo" ? "2px solid #2196F3" : "2px solid #ddd",
              borderRadius: "10px",
              background: selectedPaymentMethod === "demo" ? "#f8fbff" : "#f8f9fa",
              marginBottom: "1rem",
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

          <div
            style={{
              padding: "1rem",
              border: selectedPaymentMethod === "razorpay" ? "2px solid #FF6B35" : "2px solid #ddd",
              borderRadius: "10px",
              background: selectedPaymentMethod === "razorpay" ? "#fff8f5" : "#f8f9fa",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => setSelectedPaymentMethod("razorpay")}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={selectedPaymentMethod === "razorpay"}
                onChange={() => setSelectedPaymentMethod("razorpay")}
                style={{ marginRight: "0.5rem" }}
              />
              <strong>💳 Pay with Razorpay</strong>
            </div>
            <p style={{ fontSize: "14px", color: "#666", margin: "0", paddingLeft: "1.5rem" }}>
              Pay securely with Cards, UPI, Net Banking, and Wallets
            </p>
            <p style={{ fontSize: "12px", color: "#888", margin: "0.5rem 0 0 1.5rem" }}>
              Powered by Razorpay | Amount: ₹{getFinalTotalINR()}
            </p>
          </div>
        </div>

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
        ) : selectedPaymentMethod === "demo" ? (
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
        ) : (
          <button
            className="pay-btn"
            onClick={handleRazorpayPayment}
            disabled={isProcessing}
            style={{
              opacity: isProcessing ? 0.7 : 1,
              cursor: isProcessing ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
            }}
          >
            {isProcessing ? "🔄 Processing Razorpay Payment..." : `💳 Pay ₹${getFinalTotalINR()} with Razorpay`}
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
            ) : selectedPaymentMethod === "demo" ? (
              <div>
                <p>Please wait while we process your payment...</p>
                <p>🔄 This may take a few seconds</p>
              </div>
            ) : (
              <div>
                <p>Please wait while we process your payment...</p>
                <p>🔄 This may take a few seconds</p>
              </div>
            )}
          </div>
        )}

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

      {showEmailSuccessModal && (
        <div
          onClick={handleModalBackdropClick}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)", // Safari support
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
            animation: "modalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              padding: "2.5rem 2rem",
              borderRadius: "24px",
              textAlign: "center",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
              transform: "scale(1)",
              animation: "modalSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              position: "relative",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div
              style={{
                width: "90px",
                height: "90px",
                background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem auto",
                fontSize: "2.8rem",
                animation: "checkmarkBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                boxShadow: "0 8px 25px rgba(76, 175, 80, 0.3)",
                position: "relative",
              }}
            >
              <span style={{ animation: "checkmarkPulse 2s infinite" }}>✅</span>
              <div
                style={{
                  position: "absolute",
                  top: "-10px",
                  left: "-10px",
                  right: "-10px",
                  bottom: "-10px",
                  border: "3px solid rgba(76, 175, 80, 0.3)",
                  borderRadius: "50%",
                  animation: "pulseRing 2s infinite",
                }}
              />
            </div>

            <h2
              style={{
                color: "#1a5a1a",
                marginBottom: "1rem",
                fontSize: "1.6rem",
                fontWeight: "700",
                letterSpacing: "-0.02em",
                animation: "textSlideUp 0.6s ease-out 0.2s both",
              }}
            >
              Email Sent Successfully! 🎉
            </h2>

            <p
              style={{
                color: "#555",
                marginBottom: "1.5rem",
                fontSize: "16px",
                lineHeight: "1.6",
                animation: "textSlideUp 0.6s ease-out 0.3s both",
              }}
            >
              Your invoice has been sent to <br />
              <strong style={{ color: "#4CAF50", fontSize: "17px" }}>{customerEmail}</strong>
            </p>

            <div
              style={{
                background: "linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%)",
                padding: "1.2rem",
                borderRadius: "16px",
                border: "1px solid rgba(76, 175, 80, 0.2)",
                marginBottom: "1.5rem",
                animation: "textSlideUp 0.6s ease-out 0.4s both",
              }}
            >
              <p
                style={{
                  margin: "0",
                  fontSize: "14px",
                  color: "#2d5a2d",
                  fontWeight: "500",
                }}
              >
                📧 Check your email for the detailed invoice with order summary and payment confirmation.
              </p>
            </div>

            <button
              onClick={() => setShowEmailSuccessModal(false)}
              style={{
                background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                color: "white",
                border: "none",
                padding: "0.8rem 2.5rem",
                borderRadius: "30px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
                animation: "textSlideUp 0.6s ease-out 0.5s both",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)"
                e.target.style.boxShadow = "0 6px 20px rgba(76, 175, 80, 0.4)"
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)"
                e.target.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.3)"
              }}
            >
              Got it! ✨
            </button>

            <p
              style={{
                margin: "1rem 0 0 0",
                fontSize: "12px",
                color: "#888",
                animation: "textSlideUp 0.6s ease-out 0.6s both",
              }}
            >
              Click outside or wait to close automatically
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes checkmarkBounce {
          0% {
            opacity: 0;
            transform: scale(0.3) rotate(-10deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.1) rotate(5deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes checkmarkPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        @keyframes textSlideUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .modal-content {
            padding: 2rem 1.5rem !important;
            margin: 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Payment
