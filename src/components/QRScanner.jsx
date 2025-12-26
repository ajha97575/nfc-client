"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import QrScanner from "qr-scanner"
import { useCart } from "../utils/CartContext.jsx"
import { getProductById } from "../utils/productData.js"
import { playBeepSound, playSuccessSound, preloadAudio } from "../utils/soundUtils.js"
import "../styles/scanner.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCamera, faCircleXmark, faCircleCheck, faCircleExclamation } from "@fortawesome/free-solid-svg-icons"

const QRScannerComponent = ({ isActive = true, onProductAdded }) => {
  const videoRef = useRef(null)
  const scannerRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState("idle")
  const [lastScanned, setLastScanned] = useState("")
  const [cameraError, setCameraError] = useState(false)
  const { addItemOnce, isItemInCart } = useCart()

  useEffect(() => {
    preloadAudio()
  }, [])

  useEffect(() => {
    if (!isActive) {
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current.destroy()
        scannerRef.current = null
        setIsScanning(false)
      }
      return
    }

    const startScanner = async () => {
      try {
        if (videoRef.current && !scannerRef.current) {
          scannerRef.current = new QrScanner(videoRef.current, (result) => handleScanResult(result.data), {
            highlightScanRegion: false,
            highlightCodeOutline: false,
            preferredCamera: "environment",
            maxScansPerSecond: 2,
            returnDetailedScanResult: true,
          })

          await scannerRef.current.start()
          setIsScanning(true)
          setCameraError(false)
          console.log("📷 QR Scanner started successfully")
        }
      } catch (error) {
        console.error("Error starting scanner:", error)
        setCameraError(true)
        setIsScanning(false)
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current.destroy()
        scannerRef.current = null
        setIsScanning(false)
        console.log("📷 QR Scanner stopped")
      }
    }
  }, [isActive])

  const handleScanResult = async (data) => {
    if (data === lastScanned) return

    setLastScanned(data)
    setScanStatus("scanning")
    playBeepSound()

    console.log(`Scanning ${data}...`)

    try {
      const product = await getProductById(data)

      if (product) {
        if (isItemInCart(product.id)) {
          setTimeout(() => {
            setScanStatus("duplicate")
            console.log(`${product.name} is already in your cart!`)

            setTimeout(() => {
              setScanStatus("idle")
              setLastScanned("")
            }, 3000)
          }, 500)
        } else {
          setTimeout(() => {
            setScanStatus("success")
            playSuccessSound()
            addItemOnce(product)
            console.log(`✅ Added ${product.name} to cart!`)

            if (onProductAdded) {
              onProductAdded(product)
            }

            setTimeout(() => {
              setScanStatus("idle")
              setLastScanned("")
            }, 2000)
          }, 500)
        }
      } else {
        setTimeout(() => {
          setScanStatus("error")
          console.log(`Product ${data} not found`)

          setTimeout(() => {
            setScanStatus("idle")
            setLastScanned("")
          }, 2000)
        }, 500)
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      setTimeout(() => {
        setScanStatus("error")
        console.log("Error connecting to server")

        setTimeout(() => {
          setScanStatus("idle")
          setLastScanned("")
        }, 2000)
      }, 500)
    }
  }

  const retryCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.start()
        setIsScanning(true)
        setCameraError(false)
      } catch (error) {
        console.error("Failed to restart camera:", error)
      }
    }
  }

  if (!isActive) {
    return (
      <motion.div
        className="scanner-container"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 0.7 }}
        style={{ pointerEvents: "none" }}
      >
        <div className="scanner-placeholder">
          <div className="scanner-placeholder-icon">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <FontAwesomeIcon icon={faCamera} style={{ fontSize: "3rem" }} />
            </motion.div>
          </div>
          <h3>Scanner Inactive</h3>
          <p>Activate scanner to begin adding products</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="scanner-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <video
        ref={videoRef}
        className="scanner-video"
        playsInline
        muted
        style={{
          filter: isScanning ? "none" : "grayscale(1) blur(2px)",
          transform: isScanning ? "scale(1.02)" : "scale(1)",
        }}
      />

      <div className="scanner-overlay">
        <motion.div
          className={`scan-box ${scanStatus}`}
          animate={{
            scale: scanStatus === "scanning" ? [1, 1.03, 1] : scanStatus === "success" ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="scan-line"></div>
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
        </motion.div>
      </div>

      <AnimatePresence>
        {cameraError && (
          <motion.div
            className="camera-error-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="camera-error-content">
              <div className="error-icon">
                <FontAwesomeIcon icon={faCircleXmark} />
              </div>
              <h3>Camera Access Required</h3>
              <p>Please allow camera permissions to use the scanner</p>
              <button className="retry-button" onClick={retryCamera}>
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scanStatus !== "idle" && (
          <motion.div
            className={`scan-status ${scanStatus}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {scanStatus === "scanning" && (
              <div className="status-content">
                <div className="loading-spinner"></div>
                <p>Processing QR code...</p>
              </div>
            )}
            {scanStatus === "success" && (
              <div className="status-content">
                <div className="status-icon">
                  <FontAwesomeIcon icon={faCircleCheck} style={{ color: "var(--secondary-color)" }} />
                </div>
                <p>Product added to cart!</p>
              </div>
            )}
            {scanStatus === "error" && (
              <div className="status-content">
                <div className="status-icon">
                  <FontAwesomeIcon icon={faCircleXmark} style={{ color: "var(--danger-color)" }} />
                </div>
                <p>Product not found</p>
              </div>
            )}
            {scanStatus === "duplicate" && (
              <div className="status-content">
                <div className="status-icon">
                  <FontAwesomeIcon icon={faCircleExclamation} style={{ color: "var(--warning-color)" }} />
                </div>
                <p>Product already in cart</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="scanner-footer">
        <div className="scanner-instruction">
          {isScanning
            ? "Align QR code within the frame"
            : cameraError
              ? "Camera access needed"
              : "Initializing camera..."}
        </div>

        <div className="scanner-indicators">
          <div className={`indicator ${isScanning ? "active" : ""}`}>
            <span className="indicator-dot"></span>
            Camera {isScanning ? "Active" : "Inactive"}
          </div>
          <div className="indicator">
            <span className="indicator-dot audio"></span>
            Audio Ready
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default QRScannerComponent
