import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import './Navbar.css';

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, isLoggedIn, logout } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src="/favicon.svg" alt="Tile House logo" className="logo-mark" />
          <div>
            <div className="logo-name">Tile House</div>
            <div className="logo-tagline">Premium Tiles & Marble</div>
          </div>
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>Products</Link>
          <Link to="/offers" className={location.pathname === '/offers' ? 'active' : ''}>
            Special Offers <span className="offer-dot">●</span>
          </Link>
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact Us</Link>
        </div>

        <div className="nav-actions">
          {/* User account */}
          {isLoggedIn ? (
            <div className="user-menu-wrap">
              <button className="user-btn" onClick={() => setUserMenuOpen(p => !p)}>
                <span className="user-avatar">👤</span>
                <span className="user-name-short">{user?.name?.split(' ')[0]}</span>
                <span className="user-chevron">▾</span>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="ud-name">{user?.name}</div>
                  <div className="ud-phone">{user?.phone}</div>
                  <Link to="/my-orders" className="ud-item">📦 My Orders</Link>
                  <Link to="/profile" className="ud-item">✏️ Edit Profile</Link>
                  <button className="ud-item ud-logout" onClick={() => { logout(); navigate('/'); }}>🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-nav-btn">Sign In</Link>
          )}

          <Link to="/cart" className="cart-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </Link>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
