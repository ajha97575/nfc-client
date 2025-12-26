"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useCart } from "../utils/CartContext.jsx"
import { getProductById } from "../utils/productData.js"
import { playBeepSound, playSuccessSound, preloadAudio } from "../utils/soundUtils.js"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMobileAlt, faRss, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons"

const NFCReaderComponent = ({ isActive = true, onProductAdded }) => {
  const [isReading, setIsReading] = useState(false)
  const [nfcStatus, setNfcStatus] = useState("idle")
  const [lastRead, setLastRead] = useState("")
  const [isNFCSupported, setIsNFCSupported] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const { addItemOnce, isItemInCart } = useCart()
  const abortControllerRef = useRef(null)
  const ndefReaderRef = useRef(null)

  useEffect(() => {
    checkNFCSupport()
    preloadAudio()
  }, [])

  useEffect(() => {
    if (!isActive || !isNFCSupported) {
      stopNFCReading()
      return
    }

    if (isActive && isNFCSupported) {
      startNFCReading()
    }

    return () => {
      stopNFCReading()
    }
  }, [isActive, isNFCSupported])

  const checkNFCSupport = () => {
    if ("NDEFReader" in window) {
      setIsNFCSupported(true)
      console.log("✅ Web NFC API is supported")
    } else {
      setIsNFCSupported(false)
      console.log("❌ Web NFC API is not supported")
    }
  }

  const requestNFCPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: "nfc" })
      console.log("📱 NFC permission status:", permission.state)

      if (permission.state === "granted") {
        setPermissionGranted(true)
        return true
      } else if (permission.state === "prompt") {
        return true
      } else {
        setPermissionGranted(false)
        console.log("NFC permission denied. Please enable NFC permissions.")
        return false
      }
    } catch (error) {
      console.log("⚠️ Could not check NFC permissions:", error)
      return true
    }
  }

  const startNFCReading = async () => {
    if (!isNFCSupported || isReading) return

    try {
      setIsReading(true)
      setNfcStatus("reading")

      console.log("Requesting NFC permissions...")

      const hasPermission = await requestNFCPermission()
      if (!hasPermission) {
        setIsReading(false)
        setNfcStatus("error")
        console.log("NFC permission denied")
        return
      }

      abortControllerRef.current = new AbortController()
      ndefReaderRef.current = new window.NDEFReader()

      await ndefReaderRef.current.scan({
        signal: abortControllerRef.current.signal,
      })
      console.log("📱 NFC Reader started successfully")

      ndefReaderRef.current.addEventListener("reading", handleNFCReading)
      ndefReaderRef.current.addEventListener("readingerror", handleNFCError)

      setPermissionGranted(true)
      console.log("🎯 NFC Reader Active - Tap an NFC tag")
    } catch (error) {
      console.error("❌ Error starting NFC reader:", error)
      setIsReading(false)
      setNfcStatus("error")

      if (error.name === "NotAllowedError") {
        console.log("❌ NFC access denied. Please allow NFC permissions.")
      } else if (error.name === "NotSupportedError") {
        console.log("❌ NFC is not supported on this device.")
        setIsNFCSupported(false)
      } else if (error.name === "NotReadableError") {
        console.log("❌ NFC is disabled. Please enable NFC in device settings.")
      } else {
        console.log(`❌ NFC Error: ${error.message || "Unknown error occurred"}`)
      }
    }
  }

  const stopNFCReading = () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }

      if (ndefReaderRef.current) {
        ndefReaderRef.current.removeEventListener("reading", handleNFCReading)
        ndefReaderRef.current.removeEventListener("readingerror", handleNFCError)
        ndefReaderRef.current = null
      }

      setIsReading(false)
      setNfcStatus("idle")
      console.log("📱 NFC Reader stopped")
    } catch (error) {
      console.error("Error stopping NFC reader:", error)
    }
  }

  const handleNFCReading = (event) => {
    console.log("📱 NFC tag detected:", event.serialNumber)
    handleNFCRead(event.message, event.serialNumber)
  }

  const handleNFCError = (error) => {
    console.error("❌ NFC reading error:", error)
    setNfcStatus("error")
    console.log("❌ Error reading NFC tag. Please try again.")

    setTimeout(() => {
      if (isReading) {
        setNfcStatus("reading")
      }
    }, 2000)
  }

  const handleNFCRead = async (message, serialNumber) => {
    try {
      console.log("📱 Processing NFC tag:", serialNumber)
      console.log("📄 NFC message records:", message.records.length)

      let productId = null

      for (const record of message.records) {
        console.log("📋 Record type:", record.recordType)
        console.log("📋 Record data:", record.data)

        if (record.recordType === "text") {
          try {
            const textDecoder = new TextDecoder("utf-8")
            let text = ""

            if (record.data.byteLength > 0) {
              const firstByte = new Uint8Array(record.data)[0]

              if (firstByte < 32) {
                const languageCodeLength = firstByte & 0x3f
                const textData = record.data.slice(1 + languageCodeLength)
                text = textDecoder.decode(textData)
              } else {
                text = textDecoder.decode(record.data)
              }
            }

            console.log("📄 Decoded NFC text:", text)

            const cleanText = text.trim().toUpperCase()
            const productMatch = cleanText.match(/^(FOOD|ELEC|CLTH|BOOK|HOME|SPRT)\d{3}$/i)
            if (productMatch) {
              productId = cleanText
              console.log("✅ Found product ID in text:", productId)
              break
            }

            const extractMatch = cleanText.match(/(FOOD|ELEC|CLTH|BOOK|HOME|SPRT)\d{3}/i)
            if (extractMatch) {
              productId = extractMatch[0].toUpperCase()
              console.log("✅ Extracted product ID from text:", productId)
              break
            }
          } catch (decodeError) {
            console.error("Error decoding text record:", decodeError)

            try {
              const rawText = String.fromCharCode(...new Uint8Array(record.data))
              console.log("📄 Raw text fallback:", rawText)
              const fallbackMatch = rawText.match(/(FOOD|ELEC|CLTH|BOOK|HOME|SPRT)\d{3}/i)
              if (fallbackMatch) {
                productId = fallbackMatch[0].toUpperCase()
                console.log("✅ Found product ID in raw text:", productId)
                break
              }
            } catch (rawError) {
              console.error("Raw text fallback failed:", rawError)
            }
          }
        } else if (record.recordType === "url") {
          try {
            const url = new TextDecoder().decode(record.data)
            console.log("🔗 NFC URL content:", url)

            const urlMatch = url.match(/\/product\/([A-Z0-9]+)$/i)
            if (urlMatch) {
              const extractedId = urlMatch[1].toUpperCase()
              if (extractedId.match(/^(FOOD|ELEC|CLTH|BOOK|HOME|SPRT)\d{3}$/)) {
                productId = extractedId
                console.log("✅ Found product ID in URL:", productId)
                break
              }
            }
          } catch (decodeError) {
            console.error("Error decoding URL record:", decodeError)
          }
        }
      }

      if (!productId) {
        console.log("❌ No valid product ID found in NFC tag")
        setNfcStatus("error")
        console.log("❌ Invalid NFC tag - No product information found")

        setTimeout(() => {
          if (isReading) {
            setNfcStatus("reading")
          }
        }, 3000)
        return
      }

      if (productId === lastRead) {
        console.log("⚠️ Duplicate NFC read ignored:", productId)
        return
      }

      setLastRead(productId)
      setNfcStatus("reading")
      playBeepSound()

      console.log(`🔍 Processing ${productId}...`)

      console.log("🔍 Looking up product:", productId)
      const product = await getProductById(productId)

      if (product) {
        console.log("✅ Product found:", product.name)

        if (isItemInCart(product.id)) {
          setTimeout(() => {
            setNfcStatus("error")
            console.log(`⚠️ ${product.name} is already in your cart!`)

            setTimeout(() => {
              if (isReading) {
                setNfcStatus("reading")
                setLastRead("")
              }
            }, 4000)
          }, 500)
        } else {
          setTimeout(() => {
            setNfcStatus("success")
            playSuccessSound()
            addItemOnce(product)
            console.log(`✅ Added ${product.name} to cart via NFC!`)

            if (onProductAdded) {
              onProductAdded(product)
            }

            setTimeout(() => {
              if (isReading) {
                setNfcStatus("reading")
                setLastRead("")
              }
            }, 3000)
          }, 500)
        }
      } else {
        console.log("❌ Product not found:", productId)
        setTimeout(() => {
          setNfcStatus("error")
          console.log(`❌ Product ${productId} not found in database`)

          setTimeout(() => {
            if (isReading) {
              setNfcStatus("reading")
              setLastRead("")
            }
          }, 3000)
        }, 500)
      }

      setTimeout(() => {
        setLastRead("")
      }, 2000)
    } catch (error) {
      console.error("❌ Error processing NFC tag:", error)
      setNfcStatus("error")
      console.log("❌ Error processing NFC tag. Please try again.")

      setTimeout(() => {
        if (isReading) {
          setNfcStatus("reading")
          setLastRead("")
        }
      }, 3000)
    }
  }

  if (!isActive) {
    return (
      <motion.div
        className="nfc-container"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 0.5 }}
        style={{ pointerEvents: "none" }}
      >
        <div className="empty-state" style={{ height: "400px" }}>
          <div className="empty-state-icon">
            <FontAwesomeIcon icon={faMobileAlt} />
          </div>
          <h3>NFC Reader Disabled</h3>
          <p>Click "Add More Products" to activate</p>
        </div>
      </motion.div>
    )
  }

  if (!isNFCSupported) {
    return (
      <motion.div
        className="nfc-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="empty-state" style={{ height: "400px", background: "rgba(245, 158, 11, 0.1)" }}>
          <div className="empty-state-icon">
            <FontAwesomeIcon icon={faMobileAlt} />
          </div>
          <h3>NFC Not Supported</h3>
          <p>Your device or browser doesn't support NFC functionality.</p>
          <div
            style={{
              fontSize: "0.875rem",
              marginTop: "1rem",
              textAlign: "left",
              maxWidth: "300px",
            }}
          >
            <p>
              <strong>NFC is supported on:</strong>
            </p>
            <ul style={{ paddingLeft: "1.5rem", lineHeight: "1.6" }}>
              <li>Android devices with Chrome browser</li>
              <li>Requires HTTPS connection</li>
              <li>NFC must be enabled in device settings</li>
            </ul>
          </div>
          <p
            style={{
              fontSize: "0.875rem",
              marginTop: "1rem",
              fontWeight: "600",
            }}
          >
            Please use QR code scanning instead.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="nfc-container"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="nfc-reader">
        <motion.div
          className={`nfc-animation ${nfcStatus}`}
          animate={{
            scale: nfcStatus === "reading" ? [1, 1.1, 1] : nfcStatus === "success" ? 1.2 : 1,
          }}
          transition={{
            duration: nfcStatus === "reading" ? 2 : 0.5,
            repeat: nfcStatus === "reading" ? Number.POSITIVE_INFINITY : 0,
          }}
        >
          <div style={{ fontSize: "4rem", color: "white" }}>
            {nfcStatus === "reading" ? (
              <FontAwesomeIcon icon={faRss} />
            ) : nfcStatus === "success" ? (
              <FontAwesomeIcon icon={faCheckCircle} />
            ) : nfcStatus === "error" ? (
              <FontAwesomeIcon icon={faTimesCircle} />
            ) : (
              <FontAwesomeIcon icon={faMobileAlt} />
            )}
          </div>
        </motion.div>

        <motion.div
          style={{
            textAlign: "center",
            padding: "1rem",
            fontSize: "1rem",
            fontWeight: "600",
            color:
              nfcStatus === "success"
                ? "var(--secondary-color)"
                : nfcStatus === "error"
                  ? "var(--danger-color)"
                  : "var(--text-primary)",
            minHeight: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          {nfcStatus === "reading"
            ? "🎯 Ready to read NFC tags - Tap a product tag"
            : nfcStatus === "success"
              ? "✅ Product added successfully!"
              : nfcStatus === "error"
                ? "❌ Error reading tag"
                : "Initializing NFC reader..."}
        </motion.div>

        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "var(--text-secondary)",
            background: "rgba(255,255,255,0.95)",
            padding: "0.5rem 1rem",
            borderRadius: "var(--radius-xl)",
            fontSize: "0.75rem",
            textAlign: "center",
            border: "1px solid var(--border-light)",
            maxWidth: "90%",
            backdropFilter: "blur(10px)",
          }}
        >
          {isReading ? "Hold device near NFC tag" : "Starting NFC reader..."}
        </div>

        <div
          className={`badge ${isReading ? "secondary" : "warning"}`}
          style={{ position: "absolute", top: "1rem", right: "1rem" }}
        >
          📡 {isReading ? "ACTIVE" : "INACTIVE"}
        </div>

        {isNFCSupported && (
          <div
            className={`badge ${permissionGranted ? "secondary" : "warning"}`}
            style={{ position: "absolute", top: "1rem", left: "1rem" }}
          >
            🔐 {permissionGranted ? "ALLOWED" : "PENDING"}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default NFCReaderComponent
