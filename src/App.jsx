import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { CartProvider } from "./utils/CartContext.jsx"
import { AuthProvider, withAuth } from "./utils/AuthContext.jsx"
import LandingPage from "./pages/LandingPage.jsx"
import Home from "./pages/Home.jsx"
import Cart from "./pages/Cart.jsx"
import Payment from "./pages/Payment.jsx"
import Invoice from "./pages/Invoice.jsx"
import Orders from "./pages/Orders.jsx"
import AdminDashboard from "./pages/AdminDashboard.jsx"
import NFCManager from "./pages/NFCManager.jsx"
import AdminLogin from "./pages/AdminLogin.jsx"
import "./App.css"

const ProtectedAdminDashboard = withAuth(AdminDashboard)

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/scanner" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/invoice" element={<Invoice />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/admin" element={<ProtectedAdminDashboard />} />
              <Route path="/nfc-manager" element={<NFCManager />} />
              <Route path="/admin-login" element={<AdminLogin />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
