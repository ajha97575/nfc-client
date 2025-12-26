"use client"

import { useState, useEffect } from "react"
import { getAllProducts } from "../utils/productData.js"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faMobileAlt,
  faPenToSquare,
  faTowerBroadcast,
  faLock,
  faFileLines,
  faLink,
  faPenNib,
  faFlask,
  faClipboardList,
  faLightbulb,
  faWrench,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons"

const NFCWriterComponent = () => {
  const [isNFCSupported, setIsNFCSupported] = useState(false)
  const [isWriting, setIsWriting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState("")
  const [writeFormat, setWriteFormat] = useState("text") // text or url
  const [customUrl, setCustomUrl] = useState("https://yourstore.com/product/")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("") // success, error, info
  const [allProducts, setAllProducts] = useState({})
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    checkNFCSupport()
    loadProducts()
  }, [])

  const checkNFCSupport = async () => {
    if ("NDEFReader" in window) {
      setIsNFCSupported(true)
      console.log("✅ NFC writing is supported")

      // Check permissions
      try {
        const permission = await navigator.permissions.query({ name: "nfc" })
        setPermissionGranted(permission.state === "granted")
        console.log("📱 NFC permission status:", permission.state)
      } catch (error) {
        console.log("⚠️ Could not check NFC permissions:", error)
      }
    } else {
      setIsNFCSupported(false)
      console.log("❌ NFC writing is not supported")
    }
  }

  const loadProducts = async () => {
    try {
      const products = await getAllProducts()
      setAllProducts(products)
      console.log("📦 Loaded products for NFC writing:", Object.keys(products).length)
    } catch (error) {
      console.error("❌ Error loading products:", error)
      showMessage("Error loading products", "error")
    }
  }

  const showMessage = (msg, type) => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 6000)
  }

  const writeNFCTag = async () => {
    if (!selectedProduct) {
      showMessage("Please select a product first", "error")
      return
    }

    if (!isNFCSupported) {
      showMessage("NFC is not supported on this device", "error")
      return
    }

    setIsWriting(true)
    showMessage("Preparing to write NFC tag...", "info")

    try {
      // Use native Web NFC API
      const ndef = new window.NDEFReader()
      const records = []

      if (writeFormat === "text") {
        // Write product ID as plain text record
        records.push({
          recordType: "text",
          data: selectedProduct,
        })
        console.log("📝 Writing text record:", selectedProduct)
      } else if (writeFormat === "url") {
        // Write product URL as URL record
        const productUrl = `${customUrl}${selectedProduct}`
        records.push({
          recordType: "url",
          data: productUrl,
        })
        console.log("📝 Writing URL record:", productUrl)
      }

      // Add additional product info as a second text record
      const product = allProducts[selectedProduct]
      if (product) {
        records.push({
          recordType: "text",
          data: `${product.name} - ₹${product.price}`,
        })
      }

      showMessage("🏷️ Please tap your blank NFC tag to the device now...", "info")

      // Write to NFC tag using native Web NFC API
      await ndef.write({ records })

      setPermissionGranted(true)
      showMessage(`✅ Successfully wrote ${selectedProduct} (${product?.name}) to NFC tag!`, "success")
      console.log("✅ NFC tag written successfully:", selectedProduct)

      // Log what was written for debugging
      console.log("📋 Written records:", records)
    } catch (error) {
      console.error("❌ Error writing NFC tag:", error)

      if (error.name === "NotAllowedError") {
        showMessage("❌ NFC access denied. Please allow NFC permissions in your browser.", "error")
      } else if (error.name === "NetworkError") {
        showMessage("❌ No NFC tag found. Please place a blank NFC tag closer to your device.", "error")
      } else if (error.name === "NotSupportedError") {
        showMessage("❌ NFC writing is not supported on this device.", "error")
        setIsNFCSupported(false)
      } else if (error.name === "InvalidStateError") {
        showMessage("❌ NFC tag is not writable or already contains data. Use a blank tag.", "error")
      } else if (error.name === "NotReadableError") {
        showMessage("❌ NFC is disabled. Please enable NFC in your device settings.", "error")
      } else {
        showMessage(`❌ Failed to write NFC tag: ${error.message || "Unknown error"}`, "error")
      }
    } finally {
      setIsWriting(false)
    }
  }

  const testWrittenTag = () => {
    showMessage("💡 To test your NFC tag, go to the NFC Reader tab and tap the tag you just wrote.", "info")
  }

  const getMessageStyle = () => {
    const baseStyle = {
      padding: "1rem",
      borderRadius: "8px",
      marginTop: "1rem",
      fontSize: "14px",
      textAlign: "center",
      transition: "all 0.3s ease",
    }

    switch (messageType) {
      case "success":
        return {
          ...baseStyle,
          background: "#d4edda",
          border: "1px solid #c3e6cb",
          color: "#155724",
        }
      case "error":
        return {
          ...baseStyle,
          background: "#f8d7da",
          border: "1px solid #f5c6cb",
          color: "#721c24",
        }
      case "info":
        return {
          ...baseStyle,
          background: "#d1ecf1",
          border: "1px solid #bee5eb",
          color: "#0c5460",
        }
      default:
        return baseStyle
    }
  }

  if (!isNFCSupported) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: "15px",
          padding: "2rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          margin: "1rem 0",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
          <FontAwesomeIcon icon={faMobileAlt} style={{ color: "#666" }} />
        </div>
        <h3 style={{ color: "#856404" }}>NFC Writing Not Supported</h3>
        <p style={{ color: "#666" }}>Your device or browser doesn't support NFC writing functionality.</p>
        <div style={{ fontSize: "14px", color: "#666", marginTop: "1rem", textAlign: "left" }}>
          <p>
            <strong>NFC writing requires:</strong>
          </p>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <li>Android device with Chrome browser</li>
            <li>HTTPS connection (not localhost)</li>
            <li>NFC enabled in device settings</li>
            <li>Blank NFC tags (NTAG213/215/216)</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: "15px",
        padding: "2rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        margin: "1rem 0",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0", color: "#333" }}>
          <FontAwesomeIcon icon={faPenToSquare} style={{ marginRight: "0.5rem" }} />
          NFC Tag Writer
        </h3>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div
            style={{
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "11px",
              background: isNFCSupported ? "rgba(76, 175, 80, 0.9)" : "rgba(244, 67, 54, 0.9)",
              color: "white",
            }}
          >
            <FontAwesomeIcon icon={faTowerBroadcast} style={{ marginRight: "0.3rem" }} />
            {isNFCSupported ? "SUPPORTED" : "NOT SUPPORTED"}
          </div>
          <div
            style={{
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "11px",
              background: permissionGranted ? "rgba(76, 175, 80, 0.9)" : "rgba(255, 152, 0, 0.9)",
              color: "white",
            }}
          >
            <FontAwesomeIcon icon={faLock} style={{ marginRight: "0.3rem" }} />
            {permissionGranted ? "ALLOWED" : "PENDING"}
          </div>
        </div>
      </div>

      {/* Product Selection */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: "bold",
            color: "#555",
          }}
        >
          Select Product to Write:
        </label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "2px solid #ddd",
            borderRadius: "8px",
            fontSize: "16px",
            background: "white",
          }}
        >
          <option value="">Choose a product...</option>
          {Object.values(allProducts).map((product) => (
            <option key={product.id} value={product.id}>
              {product.id} - {product.name} (₹{product.price})
            </option>
          ))}
        </select>
      </div>

      {/* Write Format Selection */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: "bold",
            color: "#555",
          }}
        >
          NFC Data Format:
        </label>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="radio"
              name="writeFormat"
              value="text"
              checked={writeFormat === "text"}
              onChange={(e) => setWriteFormat(e.target.value)}
              style={{ marginRight: "0.5rem" }}
            />
            <span>
              <FontAwesomeIcon icon={faFileLines} style={{ marginRight: "0.3rem" }} />
              Text (Product ID only) - Recommended
            </span>
          </label>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="radio"
              name="writeFormat"
              value="url"
              checked={writeFormat === "url"}
              onChange={(e) => setWriteFormat(e.target.value)}
              style={{ marginRight: "0.5rem" }}
            />
            <span>
              <FontAwesomeIcon icon={faLink} style={{ marginRight: "0.3rem" }} />
              URL (Web link)
            </span>
          </label>
        </div>
      </div>

      {/* URL Configuration (if URL format selected) */}
      {writeFormat === "url" && (
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#555",
            }}
          >
            Base URL:
          </label>
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://yourstore.com/product/"
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "2px solid #ddd",
              borderRadius: "8px",
              fontSize: "16px",
            }}
          />
          {selectedProduct && (
            <p style={{ fontSize: "12px", color: "#666", marginTop: "0.5rem" }}>
              Full URL will be:{" "}
              <strong>
                {customUrl}
                {selectedProduct}
              </strong>
            </p>
          )}
        </div>
      )}

      {/* Preview */}
      {selectedProduct && (
        <div
          style={{
            background: "#f8f9fa",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "1px solid #dee2e6",
          }}
        >
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} style={{ marginRight: "0.5rem" }} />
            Preview - What will be written:
          </h4>
          <div style={{ fontSize: "14px", color: "#666" }}>
            <p>
              <strong>Product:</strong> {allProducts[selectedProduct]?.name}
            </p>
            <p>
              <strong>ID:</strong> {selectedProduct}
            </p>
            <p>
              <strong>Price:</strong> ₹{allProducts[selectedProduct]?.price}
            </p>
            <p>
              <strong>Format:</strong> {writeFormat === "text" ? "Text Record" : "URL Record"}
            </p>
            {writeFormat === "url" && (
              <p>
                <strong>URL:</strong> {customUrl}
                {selectedProduct}
              </p>
            )}
            <div style={{ marginTop: "0.5rem", padding: "0.5rem", background: "#e9ecef", borderRadius: "4px" }}>
              <strong>Records to write:</strong>
              <br />
              1. {writeFormat === "text" ? "Text" : "URL"}:{" "}
              {writeFormat === "text" ? selectedProduct : `${customUrl}${selectedProduct}`}
              <br />
              2. Text: {allProducts[selectedProduct]?.name} - ₹{allProducts[selectedProduct]?.price}
            </div>
          </div>
        </div>
      )}

      {/* Write Button */}
      <button
        onClick={writeNFCTag}
        disabled={isWriting || !selectedProduct}
        style={{
          width: "100%",
          padding: "1rem",
          background: isWriting || !selectedProduct ? "#ccc" : "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: isWriting || !selectedProduct ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          opacity: isWriting || !selectedProduct ? 0.7 : 1,
        }}
      >
        {isWriting ? (
          <>
            <FontAwesomeIcon icon={faPenNib} spin style={{ marginRight: "0.5rem" }} />
            Writing to NFC Tag...
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faPenNib} style={{ marginRight: "0.5rem" }} />
            Write to NFC Tag
          </>
        )}
      </button>

      {/* Test Button */}
      {selectedProduct && !isWriting && (
        <button
          onClick={testWrittenTag}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          <FontAwesomeIcon icon={faFlask} style={{ marginRight: "0.5rem" }} />
          How to Test Written Tag
        </button>
      )}

      {message && <div style={getMessageStyle()}>{message}</div>}

      {/* Instructions */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#e7f3ff",
          border: "1px solid #b3d9ff",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#0066cc",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0" }}>
          <FontAwesomeIcon icon={faClipboardList} style={{ marginRight: "0.5rem" }} />
          Step-by-Step Instructions:
        </h4>
        <ol style={{ margin: "0", paddingLeft: "1.5rem" }}>
          <li>Select a product from the dropdown above</li>
          <li>Choose format (Text is recommended for reliability)</li>
          <li>Click "Write to NFC Tag" button</li>
          <li>When prompted, place your blank NFC tag on the back of your device</li>
          <li>Keep the tag steady until you see success message</li>
          <li>Test the tag using the NFC Reader tab</li>
        </ol>

        <div style={{ marginTop: "1rem", fontSize: "12px" }}>
          <p>
            <strong>
              <FontAwesomeIcon icon={faLightbulb} style={{ marginRight: "0.3rem" }} />
              Important Tips:
            </strong>
          </p>
          <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
            <li>
              <strong>Use blank NTAG213/215/216 tags</strong> for best compatibility
            </li>
            <li>
              <strong>Text format is more reliable</strong> than URL format
            </li>
            <li>
              <strong>Keep tag steady</strong> during writing process
            </li>
            <li>
              <strong>Avoid metal surfaces</strong> when writing/reading
            </li>
            <li>
              <strong>Test immediately</strong> after writing to verify
            </li>
          </ul>
        </div>

        <div
          style={{
            marginTop: "1rem",
            padding: "0.5rem",
            background: "#fff3cd",
            borderRadius: "4px",
            border: "1px solid #ffeaa7",
          }}
        >
          <strong>
            <FontAwesomeIcon icon={faWrench} style={{ marginRight: "0.3rem" }} />
            Troubleshooting:
          </strong>
          <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem", fontSize: "12px" }}>
            <li>If writing fails, try a different blank tag</li>
            <li>Ensure NFC is enabled in device settings</li>
            <li>Make sure you're using HTTPS (not localhost)</li>
            <li>Try holding the tag in different positions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NFCWriterComponent
