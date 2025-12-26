"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import NFCWriterComponent from "../components/NFCWriter.jsx"
import NFCReaderComponent from "../components/NFCReader.jsx"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faMobileAlt,
  faArrowLeft,
  faShoppingCart,
  faFilePen,
  faTags,
  faFlask,
  fa1,
  fa2,
  fa3,
  fa4,
  faRocket,
} from "@fortawesome/free-solid-svg-icons"

const NFCManager = () => {
  const [activeTab, setActiveTab] = useState("writer") // "writer" or "reader"

  return (
    <div className="container">
      <div className="header" style={{ background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)" }}>
        <h1>
          <FontAwesomeIcon icon={faMobileAlt} /> NFC Tag Manager
        </h1>
        <p>Create and test NFC tags for your products</p>
      </div>

      <div className="nav-buttons">
        <Link to="/" className="nav-btn secondary">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
        </Link>
        <Link to="/scanner" className="nav-btn">
          <FontAwesomeIcon icon={faShoppingCart} /> Go to Scanner
        </Link>
        <button
          onClick={() => setActiveTab("writer")}
          className="nav-btn"
          style={{ background: activeTab === "writer" ? "#4CAF50" : "#2196f3" }}
        >
          <FontAwesomeIcon icon={faFilePen} /> Write Tags
        </button>
        <button
          onClick={() => setActiveTab("reader")}
          className="nav-btn"
          style={{ background: activeTab === "reader" ? "#4CAF50" : "#FF9800" }}
        >
          <FontAwesomeIcon icon={faMobileAlt} /> Test Reader
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "writer" ? (
        <div>
          <NFCWriterComponent />

          {/* NFC Tag Information */}
          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "2rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              margin: "2rem 0",
            }}
          >
            <h3 style={{ color: "#333", marginBottom: "1rem" }}>
              <FontAwesomeIcon icon={faTags} /> About NFC Tags
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
              <div>
                <h4 style={{ color: "#2196F3", marginBottom: "0.5rem" }}>What are NFC Tags?</h4>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5" }}>
                  NFC (Near Field Communication) tags are small, programmable chips that can store small amounts of
                  data. When a compatible device comes within a few centimeters, it can read the stored information
                  instantly.
                </p>
              </div>

              <div>
                <h4 style={{ color: "#2196F3", marginBottom: "0.5rem" }}>How to Use</h4>
                <ul style={{ fontSize: "14px", color: "#666", lineHeight: "1.5", paddingLeft: "1.5rem" }}>
                  <li>Buy blank NFC tags (NTAG213/215/216 recommended)</li>
                  <li>Use the writer above to program product information</li>
                  <li>Stick tags on or near your products</li>
                  <li>Customers tap their phones to add items to cart</li>
                </ul>
              </div>

              <div>
                <h4 style={{ color: "#2196F3", marginBottom: "0.5rem" }}>Tag Types</h4>
                <ul style={{ fontSize: "14px", color: "#666", lineHeight: "1.5", paddingLeft: "1.5rem" }}>
                  <li>
                    <strong>NTAG213:</strong> 180 bytes, basic use
                  </li>
                  <li>
                    <strong>NTAG215:</strong> 540 bytes, recommended
                  </li>
                  <li>
                    <strong>NTAG216:</strong> 940 bytes, advanced use
                  </li>
                </ul>
              </div>

              <div>
                <h4 style={{ color: "#2196F3", marginBottom: "0.5rem" }}>Where to Buy</h4>
                <ul style={{ fontSize: "14px", color: "#666", lineHeight: "1.5", paddingLeft: "1.5rem" }}>
                  <li>Amazon, eBay (search "NTAG213 NFC tags")</li>
                  <li>Electronics stores</li>
                  <li>Online NFC retailers</li>
                  <li>Cost: ₹10-50 per tag depending on quantity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "1rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              margin: "1rem 0",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#333", marginBottom: "1rem" }}>
              <FontAwesomeIcon icon={faFlask} /> Test Your NFC Tags
            </h3>
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              Use this reader to test NFC tags you've created. Tap any programmed tag to see if it works correctly.
            </p>
          </div>

          <NFCReaderComponent
            isActive={true}
            onProductAdded={(product) => {
              console.log("Product added via NFC test:", product)
              alert(
                `✅ NFC Test Successful!\n\nProduct: ${product.name}\nPrice: ₹${product.price}\n\nThis would normally be added to your cart.`,
              )
            }}
          />
        </div>
      )}

      {/* Setup Guide */}
      <div
        style={{
          background: "white",
          borderRadius: "15px",
          padding: "2rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          margin: "2rem 0",
        }}
      >
        <h3 style={{ color: "#333", marginBottom: "1.5rem" }}>
          <FontAwesomeIcon icon={faRocket} /> Complete Setup Guide
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          <div style={{ padding: "1rem", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
              <FontAwesomeIcon icon={fa1} />
            </div>
            <h4 style={{ color: "#333", marginBottom: "0.5rem" }}>Buy NFC Tags</h4>
            <p style={{ fontSize: "14px", color: "#666" }}>
              Purchase NTAG213 or NTAG215 tags online. Get sticker-type tags for easy application.
            </p>
          </div>

          <div style={{ padding: "1rem", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
              <FontAwesomeIcon icon={fa2} />
            </div>
            <h4 style={{ color: "#333", marginBottom: "0.5rem" }}>Program Tags</h4>
            <p style={{ fontSize: "14px", color: "#666" }}>
              Use the NFC Writer above to program each tag with a product ID.
            </p>
          </div>

          <div style={{ padding: "1rem", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
              <FontAwesomeIcon icon={fa3} />
            </div>
            <h4 style={{ color: "#333", marginBottom: "0.5rem" }}>Apply to Products</h4>
            <p style={{ fontSize: "14px", color: "#666" }}>
              Stick tags on products, shelves, or create a product catalog with tags.
            </p>
          </div>

          <div style={{ padding: "1rem", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
              <FontAwesomeIcon icon={fa4} />
            </div>
            <h4 style={{ color: "#333", marginBottom: "0.5rem" }}>Test & Deploy</h4>
            <p style={{ fontSize: "14px", color: "#666" }}>
              Test tags with the reader above, then let customers use them for shopping.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NFCManager
