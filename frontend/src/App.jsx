import React from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import NotFound from "./pages/NotFound"
import Home from "./pages/Home"
import AuthPage from "./pages/AuthPage"
import { useAuth } from "./auth"
import RedirectGoogleAuth from "./components/GoogleRedirectHandler"
import Dashboard from "./components/Dashboard"
import AdminProductList from "./components/AdminProductList"
import { ToastContainer } from "react-toastify"
import AdminProductEdit from "./components/AdminProductEdit"
import Cart from "./components/Cart"
import Checkout from "./components/Checkout"
import OrderConfirmation from "./components/OrderConfirmation"
import ReviewForm from "./components/ReviewForm"

function App() {

  const {isAuthorized} = useAuth()
  const ProtectedLogin = () => {
    return isAuthorized ? <Navigate to='/dashboard' /> : <AuthPage initialMethod='login' />
  }
  const ProtectedRegister = () => {
    return isAuthorized ? <Navigate to='/' /> : <AuthPage initialMethod='register' />
  }
 

  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <ToastContainer />  {/* To display notifications */}
        <Routes>
          <Route path="/login/callback" element={<RedirectGoogleAuth />} />
          <Route path="/login" element={<ProtectedLogin />}/>
          <Route path="/register" element={<ProtectedRegister />}/>
          <Route path="/dashboard" element={isAuthorized? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/api/products" element={<AdminProductList />}/>
          <Route path="/api/products/:id" element={<AdminProductEdit />} />
          <Route path="/cart" element={isAuthorized? <Cart /> : <Navigate to='/login' />} />  {/* To display cart items */}
          <Route path="/checkout" element={isAuthorized? <Checkout /> : <Navigate to='/login' />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} /> {/* To display order confirmation */}
          <Route path="/reviews/:id" element={<ReviewForm />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound/>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
