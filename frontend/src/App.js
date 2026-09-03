import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ContactPage from './pages/ContactPage';
import OffersPage from './pages/OffersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyOrdersPage from './pages/MyOrdersPage';
import EditProfilePage from './pages/EditProfilePage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function ScrollToTop() {
  const { key } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [key]);

  return null;
}

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/"              element={<HomePage />} />
                  <Route path="/products"      element={<ProductsPage />} />
                  <Route path="/product/:id"   element={<ProductDetailPage />} />
                  <Route path="/cart"          element={<CartPage />} />
                  <Route path="/checkout"      element={<CheckoutPage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />
                  <Route path="/contact"       element={<ContactPage />} />
                  <Route path="/offers"        element={<OffersPage />} />
                  <Route path="/login"         element={<LoginPage />} />
                  <Route path="/register"      element={<RegisterPage />} />
                  <Route path="/my-orders"     element={<MyOrdersPage />} />
                  <Route path="/profile"       element={<EditProfilePage />} />
                </Routes>
                <Footer />
              </>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
