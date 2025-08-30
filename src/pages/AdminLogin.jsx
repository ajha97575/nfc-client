"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../utils/AuthContext.jsx"
import toast from "react-hot-toast"
import "./AdminLogin.css"

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const { login, loading, error, isAuthenticated, clearError } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin")
    }
  }, [isAuthenticated, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (error) {
      clearError()
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.username || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    const result = await login(formData)

    if (result.success) {
      toast.success("Login successful! Welcome back.")
      navigate("/admin")
    } else {
      toast.error(result.message || "Login failed")
    }
  }

  return (
    <div className="admin-login-page">
      {/* Background with gradient */}
      <div className="admin-login-background">
        <div className="admin-login-gradient-overlay"></div>
      </div>

      {/* Login Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="admin-login-container"
      >
        <div className="admin-login-card">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="admin-login-header"
          >
            <div className="admin-login-logo">
              <div className="admin-login-logo-icon">🔐</div>
              <h1 className="admin-login-title">Admin Login</h1>
            </div>
            <p className="admin-login-subtitle">Access your admin dashboard</p>
          </motion.div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={handleSubmit}
            className="admin-login-form"
          >
            {/* Username Field */}
            <div className="admin-form-group">
              <label htmlFor="username" className="admin-form-label">
                Username
              </label>
              <div className="admin-form-input-container">
                <div className="admin-form-input-icon">👤</div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className="admin-form-input"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="admin-form-group">
              <label htmlFor="password" className="admin-form-label">
                Password
              </label>
              <div className="admin-form-input-container">
                <div className="admin-form-input-icon">🔒</div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="admin-form-input"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="admin-form-password-toggle"
                  disabled={loading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className={`admin-login-button ${loading ? "admin-login-button-loading" : ""}`}
            >
              {loading ? (
                <div className="admin-login-button-content">
                  <div className="admin-login-spinner"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="admin-login-button-content">
                  <span>🚀</span>
                  <span>Sign In</span>
                </div>
              )}
            </motion.button>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="admin-login-footer"
          >
            <p className="admin-login-footer-text">Secure admin access to Tip Tap Pay dashboard</p>
            <div className="admin-login-security-badge">
              <span className="admin-login-security-icon">🛡️</span>
              <span>Secured with JWT</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin
