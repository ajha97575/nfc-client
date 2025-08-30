"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { verifyAdminToken, clearAdminAuth, getAdminToken, getAdminData } from "./authUtils"

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        loading: true,
        error: null,
      }

    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        admin: action.payload.admin,
        token: action.payload.token,
        loading: false,
        error: null,
      }

    case "LOGIN_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        admin: null,
        token: null,
        loading: false,
        error: action.payload,
      }

    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        admin: null,
        token: null,
        loading: false,
        error: null,
      }

    case "VERIFY_START":
      return {
        ...state,
        loading: true,
        error: null,
      }

    case "VERIFY_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        admin: action.payload,
        loading: false,
        error: null,
      }

    case "VERIFY_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        admin: null,
        token: null,
        loading: false,
        error: null,
      }

    case "UPDATE_ADMIN":
      return {
        ...state,
        admin: action.payload,
      }

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      }

    default:
      return state
  }
}

const initialState = {
  isAuthenticated: false,
  admin: null,
  token: null,
  loading: true, // Start with loading true to check existing auth
  error: null,
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing authentication on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = getAdminToken()
      const adminData = getAdminData()

      if (token && adminData) {
        dispatch({ type: "VERIFY_START" })

        try {
          const { valid, admin } = await verifyAdminToken()

          if (valid && admin) {
            dispatch({
              type: "VERIFY_SUCCESS",
              payload: admin,
            })
            console.log("✅ Admin authentication verified")
          } else {
            dispatch({ type: "VERIFY_FAILURE" })
            console.log("❌ Admin authentication verification failed")
          }
        } catch (error) {
          console.error("Auth verification error:", error)
          dispatch({ type: "VERIFY_FAILURE" })
        }
      } else {
        // No existing auth, stop loading
        dispatch({ type: "VERIFY_FAILURE" })
      }
    }

    checkExistingAuth()
  }, [])

  const login = async (credentials) => {
    dispatch({ type: "LOGIN_START" })

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (data.success) {
        // Store token and admin data
        localStorage.setItem("adminToken", data.token)
        localStorage.setItem("adminData", JSON.stringify(data.admin))

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            admin: data.admin,
            token: data.token,
          },
        })

        console.log("✅ Admin login successful")
        return { success: true, message: data.message }
      } else {
        dispatch({
          type: "LOGIN_FAILURE",
          payload: data.message || "Login failed",
        })
        return { success: false, message: data.message || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = "Network error. Please check your connection."
      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMessage,
      })
      return { success: false, message: errorMessage }
    }
  }

  const logout = async () => {
    try {
      const token = getAdminToken()

      if (token) {
        // Call logout endpoint
        await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear local storage and state regardless of API call result
      clearAdminAuth()
      dispatch({ type: "LOGOUT" })
      console.log("🚪 Admin logged out")
    }
  }

  const updateAdmin = (adminData) => {
    // Update admin data in context and localStorage
    localStorage.setItem("adminData", JSON.stringify(adminData))
    dispatch({
      type: "UPDATE_ADMIN",
      payload: adminData,
    })
  }

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  const refreshAuth = async () => {
    if (!state.isAuthenticated) return

    try {
      const { valid, admin } = await verifyAdminToken()

      if (valid && admin) {
        dispatch({
          type: "UPDATE_ADMIN",
          payload: admin,
        })
        return true
      } else {
        dispatch({ type: "LOGOUT" })
        clearAdminAuth()
        return false
      }
    } catch (error) {
      console.error("Auth refresh error:", error)
      dispatch({ type: "LOGOUT" })
      clearAdminAuth()
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        // State
        isAuthenticated: state.isAuthenticated,
        admin: state.admin,
        token: state.token,
        loading: state.loading,
        error: state.error,

        // Actions
        login,
        logout,
        updateAdmin,
        clearError,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Higher-order component for protecting routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #e2e8f0",
                borderTop: "4px solid #667eea",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1rem",
              }}
            />
            <p style={{ color: "#718096", margin: 0 }}>Verifying authentication...</p>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = "/admin-login"
      return null
    }

    return <WrappedComponent {...props} />
  }
}
