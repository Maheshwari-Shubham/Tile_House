import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '../utils/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const CATEGORIES = [
  { key: 'floor-matte', label: 'Floor Tiles — Matte', icon: '🏠', desc: 'Anti-slip, earthy textures', params: { category: 'floor', finish: 'matte' } },
  { key: 'floor-glossy', label: 'Floor Tiles — Glossy', icon: '✨', desc: 'Mirror-finish luxury floors', params: { category: 'floor', finish: 'glossy' } },
  { key: 'wall-matte', label: 'Wall Tiles — Matte', icon: '🧱', desc: 'Smooth, modern wall designs', params: { category: 'wall', finish: 'matte' } },
  { key: 'wall-glossy', label: 'Wall Tiles — Glossy', icon: '💎', desc: 'Bright, easy-clean surfaces', params: { category: 'wall', finish: 'glossy' } },
];

const BRANDS = [
  { name: 'Somany', logo: '🟤', desc: 'India\'s leading tile brand' },
  { name: 'Kajaria', logo: '🔵', desc: 'Largest tile company in Asia' },
  { name: 'Oasis', logo: '🟢', desc: 'Premium value collection' },
  { name: 'Local Premium', logo: '⭐', desc: 'Affordable quality tiles' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProducts()
      .then(fp => setFeatured(fp.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400" alt="hero" />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">15+ Years of Excellence</div>
          <h1>Transform Your Space<br />with Premium Tiles</h1>
          <p>Explore our vast collection of floor tiles, wall tiles, marble and more from top brands like Somany, Kajaria & Oasis — delivered to your doorstep in Punjab.</p>
          <div className="hero-btns">
            <Link to="/products" className="btn-primary">Explore Collection</Link>
            <Link to="/contact" className="btn-hero-outline">Contact Us</Link>
          </div>
          <div className="hero-stats">
            <div><strong>5000+</strong><span>Products</span></div>
            <div><strong>1500+</strong><span>Happy Customers</span></div>
            <div><strong>15+</strong><span>Years Experience</span></div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="section">
        <div className="container">
          <div className="section-header section-header-left">
            <div className="section-label">Categories</div>
            <h2 className="section-title">Browse by Category</h2>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link
                to={`/products?category=${cat.params.category}&finish=${cat.params.finish}`}
                className="category-card"
                key={cat.key}
              >
                <div className="cat-icon">{cat.icon}</div>
                <h3>{cat.label}</h3>
                <p>{cat.desc}</p>
                <span className="cat-link">Shop Now →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Hand-picked bestsellers and new arrivals</p>
          </div>
          {loading ? <div className="spinner" /> : (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/products" className="btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Brands We Carry</h2>
            <p className="section-subtitle">Authorized dealer for India's most trusted tile brands</p>
          </div>
          <div className="brands-grid">
            {BRANDS.map(b => (
              <Link to={`/products?company=${b.name}`} className="brand-card" key={b.name}>
                <div className="brand-logo">{b.logo}</div>
                <h4>{b.name}</h4>
                <p>{b.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="section section-alt why-us">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Tile House?</h2>
          </div>
          <div className="why-grid">
            {[
              { icon: '🏆', title: '15+ Years Experience', desc: 'Trusted by thousands of families across Punjab for quality tiles and professional service.' },
              { icon: '🚚', title: 'Free Delivery', desc: 'We deliver to your doorstep. Our team ensures safe and timely delivery of all orders.' },
              { icon: '💰', title: 'Best Prices', desc: 'Direct dealer pricing — no middlemen. Get the best rates on all top brands.' },
              { icon: '🛠️', title: 'Expert Guidance', desc: 'Our 15+ years of expertise helps you choose the right tiles for your space and budget.' },
            ].map(w => (
              <div className="why-card" key={w.title}>
                <div className="why-icon">{w.icon}</div>
                <h4>{w.title}</h4>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Transform Your Home?</h2>
          <p>Visit our showroom or browse online — expert advice always available.</p>
          <div className="cta-btns">
            <Link to="/products" className="btn-primary">Shop Now</Link>
            <Link to="/contact" className="btn-cta-outline">Get in Touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
