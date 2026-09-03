import React from 'react';
import './ContactPage.css';

const BRANDS = ['Somany', 'Kajaria', 'Oasis', 'Local Premium'];

export default function ContactPage() {
  return (
    <div className="contact-page">
      {/* Hero */}
      <div className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Visit our showroom or get in touch — we're happy to help you find the perfect tiles.</p>
        </div>
      </div>

      <div className="container">
        {/* Info Cards */}
        <div className="contact-cards">
          {[
            { icon: '📍', title: 'Our Address', lines: ['Shop No. 12, Main Market', 'Near Bus Stand, Bhucho Mandi', 'Punjab – 151101'] },
            { icon: '📞', title: 'Call Us', lines: ['+91 9872635534', 'Mon–Sun: 9 AM – 7 PM'] },
            { icon: '✉️', title: 'Email Us', lines: ['shubhammaheshwari711@gmail.com'] },
            { icon: '🕐', title: 'Working Hours', lines: ['Monday – Saturday', '9:00 AM – 7:00 PM', 'Sunday: 10:00 AM – 4:00 PM'] },
          ].map(card => (
            <div className="contact-card" key={card.title}>
              <div className="cc-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              {card.lines.map((l, i) => <p key={i}>{l}</p>)}
            </div>
          ))}
        </div>

        {/* About + Map */}
        <div className="about-map-grid">
          <div className="about-section">
            <h2>About Tile House</h2>
            <div className="experience-badge">⭐ 15+ Years of Excellence</div>
            <p>
              Founded in 2009, Tile House has been the most trusted name for premium tiles and marble in Bhucho Mandi and surrounding areas of Punjab. What started as a small showroom has grown into a comprehensive tile destination serving over 1,500 satisfied customers.
            </p>
            <p>
              With over 15 years of hands-on experience, our founder and team have guided thousands of families and businesses in selecting the right tiles for every budget and aesthetic — from humble kitchens to luxury villas.
            </p>
            <p>
              We are authorized dealers for India's most reputed brands including <strong>Somany Ceramics, Kajaria Tiles,</strong> and <strong>Oasis</strong>, while also offering the best quality local options for budget-conscious projects. Every product we carry is personally vetted for quality, durability, and value.
            </p>
            <p>
              Our in-house team provides end-to-end service — from selecting tiles and calculating quantities to arranging skilled labour and timely delivery. We believe buying tiles should be simple, transparent, and enjoyable.
            </p>

            {/* Stats */}
            <div className="about-stats">
              {[
                { num: '15+', label: 'Years in Business' },
                { num: '5000+', label: 'Happy Customers' },
                { num: '100+', label: 'Products in Stock' },
                { num: '4', label: 'Premium Brands' },
              ].map(s => (
                <div className="about-stat" key={s.label}>
                  <strong>{s.num}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="map-section">
            <h2>Find Us</h2>
            <div className="map-placeholder">
              <iframe
                title="Tile House Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d21507.09989620524!2d74.83396475!3d30.30437025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3914fe0eb8bdb1b1%3A0xf0c6f1e08df1b2ab!2sBhucho%20Mandi%2C%20Punjab!5e0!3m2!1sen!2sin!4v1699900000000!5m2!1sen!2sin"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>
            <div className="directions-note">
              📍 Located near Bhucho Mandi Bus Stand, Main Market. Easy parking available.
            </div>

            {/* Showroom Images */}
            <h3 style={{ marginTop: '28px', marginBottom: '14px' }}>Our Showroom</h3>
            <div className="showroom-images">
              {[
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
                'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
              ].map((src, i) => (
                <img key={i} src={src} alt={`Showroom ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Brands We Work With */}
        <div className="brands-section">
          <h2>Brands We Work With</h2>
          <p>We are proud authorized dealers of India's most trusted tile and ceramic brands.</p>
          <div className="brands-row">
            {BRANDS.map(brand => (
              <div className="brand-chip" key={brand}>
                <span className="brand-chip-dot">●</span> {brand}
              </div>
            ))}
          </div>
          <div className="brand-logos-grid">
            {[
              { name: 'Somany Ceramics', icon: '🟤', desc: 'Premium tiles with innovative designs. Somany is one of India\'s largest tile manufacturers with 50+ years of heritage.' },
              { name: 'Kajaria Ceramics', icon: '🔵', desc: 'Asia\'s largest tile company. Known for quality, durability and a vast range of designs for every budget.' },
              { name: 'Oasis Tiles', icon: '🟢', desc: 'Excellent value-for-money tiles with consistent quality. Wide range of finishes for residential and commercial use.' },
              { name: 'Local Premium', icon: '⭐', desc: 'Carefully sourced local tiles offering the best prices without compromising on quality for budget projects.' },
            ].map(b => (
              <div className="brand-detail-card" key={b.name}>
                <div className="bdc-icon">{b.icon}</div>
                <h4>{b.name}</h4>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
