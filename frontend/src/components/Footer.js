import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/favicon.svg" alt="Tile House logo" className="footer-logo-mark" />
                <span>Tile House</span>
              </div>
              <p>Your trusted partner for premium tiles and marble since 2009. 15+ years of excellence in flooring solutions across Punjab.</p>
              <div className="footer-social">
                <a href="tel:+919872635534" className="social-link">📞 +91 9872635534</a>
                <a href="mailto:shubhammaheshwari711@gmail.com" className="social-link">✉️ shubhammaheshwari711@gmail.com</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <Link to="/">Home</Link>
              <Link to="/products">All Products</Link>
              <Link to="/products?category=floor">Floor Tiles</Link>
              <Link to="/products?category=wall">Wall Tiles</Link>
              <Link to="/offers">Special Offers</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
            <div className="footer-col">
              <h4>Our Brands</h4>
              <span>Somany Tiles</span>
              <span>Kajaria Ceramics</span>
              <span>Oasis Tiles</span>
              <span>Local Premium</span>
            </div>
            <div className="footer-col">
              <h4>Visit Us</h4>
              <p>Shop No. 12, Main Market<br />Marbel Market<br />Bhucho Mandi, Punjab – 151101</p>
              <p style={{marginTop: '12px'}}>Mon–Sat: 9:00 AM – 7:00 PM<br />Sunday: 10:00 AM – 4:00 PM</p>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© 2026 Tile House. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
