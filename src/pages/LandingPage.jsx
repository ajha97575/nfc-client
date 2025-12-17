"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { updatePageMeta, scrollToTop } from "../utils/pageUtils.js";
import "./LandingPage.css";

// Import Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQrcode, 
  faMobileScreen, 
  faBolt, 
  faShieldHalved,
  faEnvelope,
  faChartLine,
  faShoppingCart,
  faCreditCard,
  faReceipt,
  faCamera,
  faCheckCircle,
  faPlayCircle,
  faRocket,
  faUsers,
  faClock,
  faStar
} from '@fortawesome/free-solid-svg-icons';

const LandingPage = () => {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    updatePageMeta(
      "Tip Tap Pay - Instant QR & NFC Shopping Experience",
      "Scan QR codes or tap NFC tags to instantly add products to cart and make secure payments. Experience seamless shopping!"
    );
    scrollToTop();
  }, []);

  const handleStartShopping = () => {
    window.location.href = "https://client-ten-self-75.vercel.app/scanner";
  };

  const handlePlayVideo = () => {
    setShowVideo(true);
    if (videoRef.current) {
      setTimeout(() => {
        videoRef.current?.play();
      }, 300);
    }
  };

  const handleCloseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setShowVideo(false);
  };

  const features = [
    {
      icon: <FontAwesomeIcon icon={faQrcode} className="fa-icon-large" />,
      title: "QR Code Shopping",
      description: "Scan any product QR code to instantly add to cart and proceed to payment",
    },
    {
      icon: <FontAwesomeIcon icon={faMobileScreen} className="fa-icon-large" />,
      title: "NFC Tap & Pay",
      description: "Tap your NFC-enabled phone on tags for instant purchase and billing",
    },
    {
      icon: <FontAwesomeIcon icon={faBolt} className="fa-icon-large" />,
      title: "Instant Processing",
      description: "Scan to cart in under 2 seconds with instant payment processing",
    },
    {
      icon: <FontAwesomeIcon icon={faShieldHalved} className="fa-icon-large" />,
      title: "Secure Payments",
      description: "Bank-level security for all transactions with encrypted data",
    },
    {
      icon: <FontAwesomeIcon icon={faEnvelope} className="fa-icon-large" />,
      title: "Email Receipts",
      description: "Auto-generated bills and receipts sent directly to your email",
    },
    {
      icon: <FontAwesomeIcon icon={faChartLine} className="fa-icon-large" />,
      title: "Real-time Tracking",
      description: "Track all your purchases and payments in real-time",
    },
  ];

  const mainFeatures = [
    {
      title: "QR Code Shopping Feature",
      description: "Kisi bhi product ka QR code scan karein, product aapke cart mein automatically add ho jayega aur aap proceed to payment kar sakte hain.",
      items: [
        "QR code scanning for instant product identification",
        "Automatically adds to shopping cart",
        "Proceed to secure online payment",
        "Easy and fast checkout process",
        "Digital receipt generation",
        "Email confirmation sent immediately"
      ]
    },
    {
      title: "NFC Tap & Pay Feature",
      description: "NFC-enabled phone se product tag par tap karein, instant purchase complete karein aur automatic bill generate ho jayega.",
      items: [
        "Tap NFC tags with your phone",
        "Instant product addition to cart",
        "Contactless payment processing",
        "Auto-generated bill PDF",
        "Email delivery of receipt",
        "Transaction history tracking"
      ]
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Scan QR Code",
      description: "Product ke QR code ko apne phone se scan karein. Product details automatically fetch ho jayenge.",
      features: [
        "Instant QR recognition",
        "Product info auto-filled",
        "Price & details shown",
        "One-tap add to cart"
      ],
    },
    {
      number: "02",
      title: "Add to Cart",
      description: "Product aapke shopping cart mein automatically add ho jayega. Quantity aur options adjust kar sakte hain.",
      features: [
        "Automatic cart addition",
        "Quantity adjustment",
        "Price calculation",
        "Cart management"
      ],
    },
    {
      number: "03",
      title: "Pay Online",
      description: "Secure payment gateway se online payment complete karein. Instant confirmation milega.",
      features: [
        "Multiple payment options",
        "Secure transaction",
        "Instant confirmation",
        "Digital receipt"
      ],
    },
  ];

  const stats = [
    { number: "10K+", label: "Products", icon: <FontAwesomeIcon icon={faShoppingCart} /> },
    { number: "5K+", label: "Happy Users", icon: <FontAwesomeIcon icon={faUsers} /> },
    { number: "99.9%", label: "Uptime", icon: <FontAwesomeIcon icon={faClock} /> },
    { number: "4.9/5", label: "Rating", icon: <FontAwesomeIcon icon={faStar} /> },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content"
          >
            <span className="hero-badge">✨ Future of Shopping</span>
            <h1 className="hero-title">
              Shop with
              <span className="hero-title-gradient"> Tap & Scan</span>
            </h1>
            <p className="hero-description">
              QR code scan karein ya NFC tag tap karein - product instantly cart mein add ho jayega 
              aur secure payment se purchase complete karein. Bill automatically generate hoga.
            </p>
            
            <div className="hero-actions">
              <button 
                onClick={handleStartShopping}
                className="hero-button hero-button-primary"
              >
                <FontAwesomeIcon icon={faShoppingCart} />
                Start Shopping
              </button>
              
              <button 
                onClick={handlePlayVideo}
                className="hero-button hero-button-secondary"
              >
                <FontAwesomeIcon icon={faPlayCircle} />
                Watch Demo
              </button>
            </div>
            
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="hero-stat">
                  <div className="hero-stat-number">{stat.number}</div>
                  <div className="hero-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-visual"
          >
            <div className="hero-card">
              <div className="hero-card-header">
                <div className="hero-card-icon">
                  <FontAwesomeIcon icon={faMobileScreen} />
                </div>
                <h3 className="hero-card-title">Shopping Process</h3>
              </div>
              <div className="hero-card-content">
                {[
                  { icon: <FontAwesomeIcon icon={faCamera} />, title: "Scan QR Code", description: "Product QR scan karein" },
                  { icon: <FontAwesomeIcon icon={faShoppingCart} />, title: "Add to Cart", description: "Automatically cart mein jayega" },
                  { icon: <FontAwesomeIcon icon={faCreditCard} />, title: "Pay Online", description: "Secure payment complete karein" },
                  { icon: <FontAwesomeIcon icon={faReceipt} />, title: "Get Receipt", description: "Email par bill aa jayega" },
                ].map((item, index) => (
                  <div key={index} className="hero-card-item">
                    <div className="hero-card-icon-small">
                      {item.icon}
                    </div>
                    <div className="hero-card-text">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-subtitle">Our Features</span>
          <h2 className="section-title">Major Shopping Features</h2>
          <p className="section-description">
            Experience seamless shopping with our advanced QR and NFC technology
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="feature-card"
            >
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Features Showcase */}
      <section className="how-it-works-section">
        <div className="section-header">
          <span className="section-subtitle">Core Features</span>
          <h2 className="section-title">Key Shopping Features</h2>
          <p className="section-description">
            Hamare do major features jo aapki shopping experience ko transform karenge
          </p>
        </div>
        
        <div className="steps-container">
          {mainFeatures.map((feature, index) => (
            <div key={index} className="step">
              <div className="step-line">
                <div className="step-number">0{index + 1}</div>
              </div>
              <div className="step-content">
                <h3 className="step-title">{feature.title}</h3>
                <p className="step-description">{feature.description}</p>
                <div className="step-features">
                  {feature.items.map((item, fIndex) => (
                    <div key={fIndex} className="step-feature">
                      <div className="step-feature-icon">
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </div>
                      <span className="step-feature-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <span className="section-subtitle">Simple Process</span>
          <h2 className="section-title">How It Works</h2>
          <p className="section-description">
            Shopping made simple in just 3 easy steps
          </p>
        </div>
        
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-line">
                <div className="step-number">{step.number}</div>
              </div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                <div className="step-features">
                  {step.features.map((feature, fIndex) => (
                    <div key={fIndex} className="step-feature">
                      <div className="step-feature-icon">
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </div>
                      <span className="step-feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="cta-title">Ready to Experience?</h2>
            <p className="cta-description">
              Join thousands of users who are already enjoying seamless shopping. 
              No setup required, start instantly!
            </p>
            
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <button 
                onClick={handleStartShopping}
                className="hero-button hero-button-primary"
                style={{ background: 'white', color: '#2563eb' }}
              >
                <FontAwesomeIcon icon={faRocket} />
                Start Shopping Now
              </button>
              
              <button 
                onClick={handlePlayVideo}
                className="hero-button hero-button-secondary"
                style={{ borderColor: 'rgba(255, 255, 255, 0.3)', color: 'white' }}
              >
                <FontAwesomeIcon icon={faPlayCircle} />
                Watch Full Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <h2 className="footer-title">Tip Tap Pay</h2>
          <p className="footer-description">
            Experience the future of shopping with instant QR scanning and NFC tap technology. 
            Making shopping faster, smarter, and more secure.
          </p>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Tip Tap Pay. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <div className="video-modal-overlay" onClick={handleCloseVideo}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseVideo}>
              ×
            </button>
            <div className="video-container">
              <video 
                ref={videoRef}
                controls 
                autoPlay
                style={{ width: '100%', height: 'auto' }}
              >
                <source src="/demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;