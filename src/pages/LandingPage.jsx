"use client";

import { useState, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Canvas, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Float,
  Sphere,
  MeshDistortMaterial,
  Box,
  Text,
} from "@react-three/drei";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { updatePageMeta, scrollToTop } from "../utils/pageUtils.js";
import "./LandingPage.css";

// 3D Phone Component (Simplified)
const Phone3D = () => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <group>
        {/* Phone Body */}
        <mesh position={[0, 0, 0]} rotation={[0.1, 0.3, 0]}>
          <boxGeometry args={[2, 4, 0.3]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Screen */}
        <mesh position={[0, 0, 0.16]} rotation={[0.1, 0.3, 0]}>
          <boxGeometry args={[1.8, 3.6, 0.02]} />
          <meshStandardMaterial
            color="#4f46e5"
            emissive="#4f46e5"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* NFC Symbol */}
        <Text
          position={[0, 0, 0.2]}
          rotation={[0.1, 0.3, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          NFC
        </Text>
      </group>
    </Float>
  );
};

// 3D Card Component
const Card3D = ({ position, color, text }) => {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <group position={position}>
        <Box args={[1.5, 2, 0.1]}>
          <meshStandardMaterial color={color} metalness={0.1} roughness={0.3} />
        </Box>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {text}
        </Text>
      </group>
    </Float>
  );
};

// Floating Spheres
const FloatingSpheres = () => {
  return (
    <>
      <Float speed={1} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[0.3]} position={[-4, 2, -2]}>
          <MeshDistortMaterial color="#6366f1" distort={0.3} speed={2} />
        </Sphere>
      </Float>

      <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5}>
        <Sphere args={[0.2]} position={[4, -1, -1]}>
          <MeshDistortMaterial color="#10b981" distort={0.4} speed={3} />
        </Sphere>
      </Float>

      <Float speed={0.8} rotationIntensity={0.5} floatIntensity={2.5}>
        <Sphere args={[0.25]} position={[3, 3, -3]}>
          <MeshDistortMaterial color="#f59e0b" distort={0.2} speed={1.5} />
        </Sphere>
      </Float>
    </>
  );
};

// Custom Environment loader to use local HDR file
const CustomEnvironment = () => {
  // Load HDR file from public/images/myCustomEnv.hdr
  const hdrTexture = useLoader(RGBELoader, "/images/myCustomEnv.hdr");

  return <Environment background={true} map={hdrTexture} />;
};

// 3D Scene Component with custom HDR environment
const Scene3D = () => {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />

      {/* Use Custom HDR environment */}
      <CustomEnvironment />

      <Phone3D />
      <Card3D position={[-3, 1, -1]} color="#6366f1" text="SHOP" />
      <Card3D position={[3, -1, -1]} color="#10b981" text="PAY" />
      <FloatingSpheres />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

// Simple fallback without loading animations
const Simple3DFallback = () => (
  <div className="hero-3d-fallback">
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: "1rem",
      }}
    >
      {/* 🌟 3D Experience Loading... */}
    </div>
  </div>
);

const LandingPage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    updatePageMeta(
      "Tip Tap Pay - Modern NFC & QR Shopping Experience",
      "Revolutionary shopping experience with NFC tags and QR codes. Tap, scan, and shop instantly with our modern digital commerce platform."
    );
    scrollToTop();
  }, []);

  const features = [
    {
      icon: "📱",
      title: "NFC Technology",
      description:
        "Simply tap your phone on NFC tags to instantly add products to your cart",
      glowClass: "feature-card-glow-blue",
    },
    {
      icon: "📷",
      title: "QR Code Scanning",
      description:
        "Scan QR codes with your camera for quick product identification",
      glowClass: "feature-card-glow-green",
    },
    {
      icon: "🛒",
      title: "Smart Cart",
      description:
        "Intelligent shopping cart with real-time updates and duplicate prevention",
      glowClass: "feature-card-glow-orange",
    },
    {
      icon: "💳",
      title: "Instant Payment",
      description: "Secure UPI payments with instant transaction processing",
      glowClass: "feature-card-glow-purple",
    },
  ];

  const stats = [
    { number: "10K+", label: "Products", icon: "📦" },
    { number: "5K+", label: "Happy Users", icon: "😊" },
    { number: "99.9%", label: "Uptime", icon: "⚡" },
    { number: "24/7", label: "Support", icon: "🛟" },
  ];

  const steps = [
    {
      step: "01",
      title: "Tap or Scan",
      description:
        "Use NFC tap or QR code scanning to identify products instantly",
      icon: "📱",
      glowClass: "step-card-glow-blue",
      numberClass: "step-number-blue",
    },
    {
      step: "02",
      title: "Add to Cart",
      description:
        "Products are automatically added to your smart shopping cart",
      icon: "🛒",
      glowClass: "step-card-glow-green",
      numberClass: "step-number-green",
    },
    {
      step: "03",
      title: "Pay & Go",
      description: "Complete payment with UPI and receive instant confirmation",
      icon: "💳",
      glowClass: "step-card-glow-purple",
      numberClass: "step-number-purple",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        {/* 3D Background */}
        <div className="hero-3d-background">
          <Suspense fallback={<Simple3DFallback />}>
            <Scene3D />
          </Suspense>
        </div>

        {/* Gradient Overlay */}
        <div className="hero-gradient-overlay"></div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hero-content"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-title-container"
          >
            <h1 className="hero-main-title">Tip Tap Pay</h1>
            <div className="hero-subtitle">
              Future of{" "}
              <span className="hero-subtitle-highlight">Digital Shopping</span>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="hero-description"
          >
            Experience the magic of NFC technology and QR codes.
            <br />
            <span className="hero-description-highlight">
              Tap, Scan, Shop - It's that simple!
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="hero-buttons"
          >
            <Link to="/scanner" className="hero-button hero-button-primary">
              <span className="hero-button-content">🚀 Start Shopping</span>
              <div className="hero-button-overlay"></div>
            </Link>

            <Link
              to="/nfc-manager"
              className="hero-button hero-button-secondary"
            >
              <span className="hero-button-content">📱 NFC Manager</span>
              <div className="hero-button-overlay"></div>
            </Link>
          </motion.div>

          {/* Scroll Indicator - Now positioned after buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="scroll-indicator"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
              className="scroll-indicator-content"
            >
              <span>Scroll to explore</span>
              <div className="scroll-indicator-mouse">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className="scroll-indicator-dot"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="section bg-gradient-features">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2 className="section-title section-title-blue">
              Amazing Features
            </h2>
            <p className="section-description">
              Discover the powerful features that make shopping effortless and
              enjoyable
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="feature-card"
              >
                <div className={`feature-icon ${feature.glowClass}`}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section bg-gradient-stats">
        <div className="section-container stats-container">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="stat-card"
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section bg-gradient-steps">
        <div className="section-container steps-container">
          {steps.map(
            (
              { step, title, description, icon, glowClass, numberClass },
              index
            ) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`step-card ${glowClass}`}
              >
                <div className={`step-number ${numberClass}`}>{step}</div>
                <div className="step-icon">{icon}</div>
                <h3 className="step-title">{title}</h3>
                <p className="step-description">{description}</p>
              </motion.div>
            )
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
