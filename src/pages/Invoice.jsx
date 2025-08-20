"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import QRScannerComponent from "../components/QRScanner.jsx";
import ManualProductEntry from "../components/ManualProductEntry.jsx";
import NFCReaderComponent from "../components/NFCReader.jsx";
import { useCart } from "../utils/CartContext.jsx";
import { updatePageMeta, scrollToTop } from "../utils/pageUtils.js";

const Home = () => {
  const { getItemCount, items, clearCart } = useCart();
  const [isScannerActive, setIsScannerActive] = useState(true);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [scanMode, setScanMode] = useState("qr"); // "qr" or "nfc"

  useEffect(() => {
    updatePageMeta(
      "Scanner - QR & NFC Scanner",
      "Scan QR codes and NFC tags to add products to your cart. Modern shopping experience with instant product recognition."
    );
    scrollToTop();
  }, []);

  const handleProductAdded = (product) => {
    setLastAddedProduct(product);
    setIsScannerActive(false);

    console.log(`✅ ${product.name} added to cart!`);
  };

  const handleAddMoreProducts = () => {
    setIsScannerActive(true);
    setLastAddedProduct(null);
    console.log("Scanner activated! Ready to scan more products.");
  };

  const handleClearCart = () => {
    clearCart();
    if (window.resetScannedProducts) {
      window.resetScannedProducts();
    }
    setLastAddedProduct(null);
    setIsScannerActive(true);
    console.log("Cart cleared successfully!");
  };

  const toggleManualEntry = () => {
    setShowManualEntry(!showManualEntry);
    console.log(
      showManualEntry ? "Scanner mode activated" : "Manual entry mode activated"
    );
  };

  const handleScanModeChange = (mode) => {
    setScanMode(mode);
    console.log(
      mode === "qr" ? "QR Scanner activated" : "NFC Reader activated"
    );
  };

  return (
    <div className="container">
      <motion.div
        className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>🚀 Tip Tap Pay Scanner</h1>
        <p>Scan QR codes & NFC tags to add products instantly</p>
      </motion.div>

      <motion.div
        className="nav-buttons"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Link to="/" className="nav-btn secondary">
          ← Back to Home
        </Link>

        <Link to="/cart" className="nav-btn secondary">
          🛒 Cart ({getItemCount()})
        </Link>

        {items.length > 0 && (
          <Link to="/cart" className="nav-btn primary">
            💳 Checkout
          </Link>
        )}

        <Link to="/nfc-manager" className="nav-btn accent">
          📱 NFC Manager
        </Link>

        <button
          onClick={() => handleScanModeChange("qr")}
          className={`nav-btn ${scanMode === "qr" ? "primary" : "info"}`}
        >
          {scanMode === "qr" ? "📷 QR Active" : "📷 QR Scanner"}
        </button>

        <button
          onClick={() => handleScanModeChange("nfc")}
          className={`nav-btn ${scanMode === "nfc" ? "primary" : "accent"}`}
        >
          {scanMode === "nfc" ? "📱 NFC Active" : "📱 NFC Reader"}
        </button>

        <button
          onClick={toggleManualEntry}
          className={`nav-btn ${showManualEntry ? "accent" : "info"}`}
        >
          {showManualEntry ? "📷 Show Scanner" : "📝 Manual Entry"}
        </button>

        {items.length > 0 && (
          <button onClick={handleClearCart} className="nav-btn danger">
            🗑️ Clear Cart
          </button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {!isScannerActive && lastAddedProduct && !showManualEntry && (
          <motion.div
            key="success-message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="status-message success"
            style={{ margin: "1rem 0" }}
          >
            <h3
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "1.125rem",
                fontWeight: "600",
              }}
            >
              ✅ Product Added Successfully!
            </h3>
            <p style={{ margin: "0 0 0.5rem 0" }}>
              <strong>{lastAddedProduct.name}</strong> has been added to your
              cart.
            </p>
            <p style={{ margin: "0", fontSize: "0.875rem", opacity: "0.8" }}>
              Use the cart to modify quantities or scan more products.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isScannerActive && !showManualEntry && (
          <motion.div
            key="add-more-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ textAlign: "center", margin: "1.5rem 0" }}
          >
            <button
              onClick={handleAddMoreProducts}
              className="nav-btn primary"
              style={{
                fontSize: "1.125rem",
                padding: "1rem 2rem",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              📱 Add More Products
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={showManualEntry ? "manual" : scanMode}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {showManualEntry ? (
          <ManualProductEntry onProductAdded={handleProductAdded} />
        ) : scanMode === "qr" ? (
          <QRScannerComponent
            isActive={isScannerActive}
            onProductAdded={handleProductAdded}
          />
        ) : (
          <NFCReaderComponent
            isActive={isScannerActive}
            onProductAdded={handleProductAdded}
          />
        )}
      </motion.div>

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{ marginTop: "2rem" }}
      >
        <h3
          style={{
            marginBottom: "1.5rem",
            textAlign: "center",
            color: "var(--text-primary)",
          }}
        >
          📖 How to Use
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          <div>
            <h4
              style={{
                color: "var(--primary-color)",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {showManualEntry ? "📝" : scanMode === "qr" ? "📷" : "📱"}
              {showManualEntry
                ? "Manual Entry"
                : scanMode === "qr"
                ? "QR Scanner"
                : "NFC Reader"}
            </h4>
            <ol
              style={{
                paddingLeft: "1.5rem",
                lineHeight: "1.8",
                color: "var(--text-secondary)",
              }}
            >
              {showManualEntry ? (
                <>
                  <li>Browse all available products in the list</li>
                  <li>Click the "Add to Cart" button to add products</li>
                  <li>Or enter a Product ID manually</li>
                  <li>Use search and category filters</li>
                  <li>Switch to scanner mode for QR/NFC</li>
                </>
              ) : scanMode === "qr" ? (
                <>
                  <li>Point your camera at a QR code</li>
                  <li>Wait for the green animation and sound</li>
                  <li>Product will be added automatically</li>
                  <li>Duplicates are prevented</li>
                  <li>Use cart to modify quantities</li>
                </>
              ) : (
                <>
                  <li>Hold your device near an NFC tag</li>
                  <li>Wait for the blue animation and sound</li>
                  <li>Product will be added automatically</li>
                  <li>Duplicates are prevented</li>
                  <li>Use cart to modify quantities</li>
                </>
              )}
            </ol>
          </div>

          <div>
            <h4
              style={{ color: "var(--secondary-color)", marginBottom: "1rem" }}
            >
              🏷️ Sample Product IDs
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "0.75rem",
                fontSize: "0.875rem",
              }}
            >
              <div className="badge primary">🍽️ Food: FOOD001-015</div>
              <div className="badge info">📱 Electronics: ELEC001-020</div>
              <div className="badge secondary">👕 Clothes: CLTH001-020</div>
              <div className="badge warning">📚 Books: BOOK001-015</div>
              <div className="badge danger">🏠 Home: HOME001-015</div>
              <div className="badge primary">⚽ Sports: SPRT001-015</div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                marginTop: "2rem",
                padding: "1.5rem",
                background:
                  "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-light)",
              }}
            >
              <h4
                style={{
                  margin: "0 0 1rem 0",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                🛒 Current Cart Summary
              </h4>
              <div
                style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
              >
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      margin: "0.5rem 0",
                      padding: "0.5rem",
                      background: "var(--bg-primary)",
                      borderRadius: "var(--radius-md)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span
                      style={{
                        fontWeight: "600",
                        color: "var(--secondary-color)",
                      }}
                    >
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </motion.div>
                ))}
                <div
                  style={{
                    fontWeight: "700",
                    marginTop: "1rem",
                    fontSize: "1.125rem",
                    color: "var(--primary-color)",
                    textAlign: "right",
                    padding: "0.75rem",
                    background: "var(--bg-primary)",
                    borderRadius: "var(--radius-md)",
                    border: "2px solid var(--primary-color)",
                  }}
                >
                  Total: ₹
                  {items
                    .reduce(
                      (total, item) => total + item.price * item.quantity,
                      0
                    )
                    .toFixed(2)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background:
              "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            borderRadius: "var(--radius-xl)",
            fontSize: "0.875rem",
            color: "var(--primary-dark)",
          }}
        >
          <h4
            style={{
              margin: "0 0 1rem 0",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            ✨ Features
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem",
            }}
          >
            <div>• Smart product browser with filters</div>
            <div>• One-click add to cart</div>
            <div>• Real-time search functionality</div>
            <div>• Duplicate prevention system</div>
            <div>• Modern toast notifications</div>
            <div>• Responsive design for all devices</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
