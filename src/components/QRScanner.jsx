"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import QrScanner from "qr-scanner";
import { useCart } from "../utils/CartContext.jsx";
import { getProductById } from "../utils/productData.js";
import {
  playBeepSound,
  playSuccessSound,
  preloadAudio,
} from "../utils/soundUtils.js";

const QRScannerComponent = ({ isActive = true, onProductAdded }) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("idle");
  const [lastScanned, setLastScanned] = useState("");
  const { addItemOnce, isItemInCart } = useCart();

  useEffect(() => {
    preloadAudio();
  }, []);

  useEffect(() => {
    if (!isActive) {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
        setIsScanning(false);
      }
      return;
    }

    const startScanner = async () => {
      try {
        if (videoRef.current && !scannerRef.current) {
          scannerRef.current = new QrScanner(
            videoRef.current,
            (result) => handleScanResult(result.data),
            {
              highlightScanRegion: false,
              highlightCodeOutline: false,
              preferredCamera: "environment",
            }
          );

          await scannerRef.current.start();
          setIsScanning(true);
          console.log("QR Scanner activated!");
          console.log("📷 QR Scanner started");
        }
      } catch (error) {
        console.error("Error starting scanner:", error);
        console.log("Camera access denied or not available");
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
        setIsScanning(false);
        console.log("📷 QR Scanner stopped");
      }
    };
  }, [isActive]);

  const handleScanResult = async (data) => {
    if (data === lastScanned) return;

    setLastScanned(data);
    setScanStatus("scanning");
    playBeepSound();

    console.log(`Scanning ${data}...`);

    try {
      const product = await getProductById(data);

      if (product) {
        if (isItemInCart(product.id)) {
          setTimeout(() => {
            setScanStatus("error");
            console.log(`${product.name} is already in your cart!`);

            setTimeout(() => {
              setScanStatus("idle");
              setLastScanned("");
            }, 3000);
          }, 500);
        } else {
          setTimeout(() => {
            setScanStatus("success");
            playSuccessSound();
            addItemOnce(product);
            console.log(`✅ Added ${product.name} to cart!`);

            if (onProductAdded) {
              onProductAdded(product);
            }

            setTimeout(() => {
              setScanStatus("idle");
              setLastScanned("");
            }, 2000);
          }, 500);
        }
      } else {
        setTimeout(() => {
          setScanStatus("error");
          console.log(`Product ${data} not found`);

          setTimeout(() => {
            setScanStatus("idle");
            setLastScanned("");
          }, 2000);
        }, 500);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setTimeout(() => {
        setScanStatus("error");
        console.log("Error connecting to server");

        setTimeout(() => {
          setScanStatus("idle");
          setLastScanned("");
        }, 2000);
      }, 500);
    }
  };

  if (!isActive) {
    return (
      <motion.div
        className="scanner-container"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 0.5 }}
        style={{ pointerEvents: "none" }}
      >
        <div className="empty-state" style={{ height: "400px" }}>
          <div className="empty-state-icon">📷</div>
          <h3>Scanner Disabled</h3>
          <p>Click "Add More Products" to activate</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="scanner-container"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <video ref={videoRef} className="scanner-video" playsInline muted />

      <div className="scanner-overlay">
        <motion.div
          className={`scan-box ${scanStatus}`}
          animate={{
            scale:
              scanStatus === "scanning"
                ? 1.05
                : scanStatus === "success"
                ? 1.1
                : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="scan-corners"></div>
        </motion.div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          background: "rgba(0,0,0,0.8)",
          padding: "0.75rem 1.5rem",
          borderRadius: "var(--radius-xl)",
          fontSize: "0.875rem",
          textAlign: "center",
          backdropFilter: "blur(10px)",
        }}
      >
        {isScanning ? "Point camera at QR code" : "Starting camera..."}
      </div>

      <div
        className="badge info"
        style={{ position: "absolute", top: "1rem", right: "1rem" }}
      >
        🔊 Sound Ready
      </div>

      <div
        className={`badge ${isScanning ? "secondary" : "warning"}`}
        style={{ position: "absolute", top: "1rem", left: "1rem" }}
      >
        📷 {isScanning ? "ACTIVE" : "STARTING"}
      </div>
    </motion.div>
  );
};

export default QRScannerComponent;
