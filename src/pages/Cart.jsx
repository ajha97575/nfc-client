"use client"

import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../utils/CartContext.jsx"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faShoppingCart, faTrashCan, faCreditCard, faFloppyDisk } from "@fortawesome/free-solid-svg-icons"

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (items.length > 0) {
      navigate("/payment")
    }
  }

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart? This action cannot be undone.")) {
      clearCart()
    }
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="header">
          <h1>Shopping Cart</h1>
        </div>

        <div className="nav-buttons">
          <Link to="/" className="nav-btn secondary">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
          </Link>
          <Link to="/scanner" className="nav-btn">
            <FontAwesomeIcon icon={faShoppingCart} /> Start Shopping
          </Link>
        </div>

        <div className="cart-container">
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
            <h2>Your cart is empty</h2>
            <p>Scan some QR codes to add products!</p>
            <Link to="/scanner" className="nav-btn" style={{ marginTop: "1rem" }}>
              Start Scanning Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Shopping Cart</h1>
        <p>
          {items.length} item{items.length !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="nav-buttons">
        <Link to="/" className="nav-btn secondary">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
        </Link>
        <Link to="/scanner" className="nav-btn">
          <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
        </Link>
        <button onClick={handleClearCart} className="nav-btn danger">
          <FontAwesomeIcon icon={faTrashCan} /> Clear Cart
        </button>
      </div>

      <div className="cart-container">
        {items.map((item) => (
          <div key={item.id} className="cart-item">
            <img src={item.image || "/placeholder.svg"} alt={item.name} />

            <div className="cart-item-details">
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">₹{item.price.toFixed(2)} each</div>
              <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
              </div>

              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  style={{
                    opacity: item.quantity <= 1 ? 0.5 : 1,
                    cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                  }}
                >
                  -
                </button>
                <span
                  style={{
                    margin: "0 1rem",
                    fontWeight: "bold",
                    minWidth: "30px",
                    textAlign: "center",
                  }}
                >
                  {item.quantity}
                </span>
                <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  +
                </button>
              </div>
            </div>

            <button className="remove-btn" onClick={() => removeItem(item.id)}>
              <FontAwesomeIcon icon={faTrashCan} /> Remove
            </button>
          </div>
        ))}

        <div className="cart-total">
          <div style={{ marginBottom: "1rem", fontSize: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "0.5rem 0",
              }}
            >
              <span>Subtotal:</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "0.5rem 0",
              }}
            >
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <hr style={{ margin: "1rem 0" }} />
          </div>

          <div className="total-amount">Total: ₹{getTotal().toFixed(2)}</div>

          <button className="nav-btn" style={{ marginTop: "1rem", fontSize: "1.2rem" }} onClick={handleCheckout}>
            <FontAwesomeIcon icon={faCreditCard} /> Proceed to Checkout
          </button>
        </div>
      </div>

      {/* Persistence Info */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#e7f3ff",
          border: "1px solid #b3d9ff",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#0066cc",
          textAlign: "center",
        }}
      >
        <FontAwesomeIcon icon={faFloppyDisk} /> Your cart is automatically saved and will persist even if you refresh
        the browser!
      </div>
    </div>
  )
}

export default Cart
