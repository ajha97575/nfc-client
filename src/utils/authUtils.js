// Authentication utility functions

// Get API URL based on environment
export const getApiBaseUrl = () => {
  // Use deployed URL in production, local URL in development
  if (import.meta.env.VITE_NODE_ENV === 'production') {
    return import.meta.env.VITE_DEPLOYED_API_URL || 'https://server-azure-five-33.vercel.app/api'
  } else {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
  }
}

// Get stored admin token
export const getAdminToken = () => {
  return localStorage.getItem("adminToken")
}

// Get stored admin data
export const getAdminData = () => {
  const data = localStorage.getItem("adminData")
  return data ? JSON.parse(data) : null
}

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const token = getAdminToken()
  const adminData = getAdminData()
  return !!(token && adminData)
}

// Clear admin authentication data
export const clearAdminAuth = () => {
  localStorage.removeItem("adminToken")
  localStorage.removeItem("adminData")
}

// Verify token with server
export const verifyAdminToken = async (apiUrl = null) => {
  const token = getAdminToken()
  const baseUrl = apiUrl || getApiBaseUrl()

  if (!token) {
    return { valid: false, admin: null }
  }

  try {
    const response = await fetch(`${baseUrl}/auth/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (data.success) {
      // Update stored admin data
      localStorage.setItem("adminData", JSON.stringify(data.admin))
      return { valid: true, admin: data.admin }
    } else {
      // Clear invalid token
      clearAdminAuth()
      return { valid: false, admin: null }
    }
  } catch (error) {
    console.error("Token verification error:", error)
    clearAdminAuth()
    return { valid: false, admin: null }
  }
}

// Make authenticated API request
export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = getAdminToken()
  const baseUrl = getApiBaseUrl()

  if (!token) {
    throw new Error("No authentication token found")
  }

  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }

  const requestOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  const response = await fetch(`${baseUrl}${url}`, requestOptions)

  // Handle unauthorized responses
  if (response.status === 401) {
    clearAdminAuth()
    window.location.href = "/admin-login"
    throw new Error("Authentication expired")
  }

  return response
}

// Admin logout
export const logoutAdmin = async () => {
  try {
    const token = getAdminToken()
    const baseUrl = getApiBaseUrl()

    if (token) {
      await fetch(`${baseUrl}/auth/logout`, {
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
    clearAdminAuth()
  }
}