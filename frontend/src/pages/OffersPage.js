import React, { useEffect, useState } from 'react';
import { getActiveOffers } from '../utils/api';
import { Link } from 'react-router-dom';
import './OffersPage.css';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveOffers()
      .then(r => setOffers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="offers-page">
      <div className="offers-hero">
        <div className="container">
          <h1>🎉 Special Offers</h1>
          <p>Exclusive deals and discounts — updated regularly by our team</p>
        </div>
      </div>
      <div className="container">
        {loading ? <div className="spinner" /> : offers.length === 0 ? (
          <div className="no-offers">
            <div style={{ fontSize: 60 }}>🔖</div>
            <h3>No Active Offers Right Now</h3>
            <p>Check back soon — we update our offers regularly!</p>
            <Link to="/products" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="offers-grid">
            {offers.map(offer => (
              <div className="offer-big-card" key={offer._id}>
                <div className="obc-left">
                  {offer.type === 'percent' ? (
                    <div className="obc-discount">{offer.discountPercent}% OFF</div>
                  ) : (
                    <div className="obc-discount">₹{offer.discountAmount} OFF</div>
                  )}
                </div>
                <div className="obc-right">
                  <h3>{offer.title}</h3>
                  <p>{offer.description}</p>
                  {offer.couponCode && (
                    <div style={{marginTop:12,padding:'8px 14px',background:'#FFF8E1',border:'2px dashed #F57F17',borderRadius:8,display:'inline-block'}}>
                      <span style={{fontSize:12,color:'#795548',fontWeight:600}}>Coupon Code: </span>
                      <span style={{fontFamily:'monospace',fontWeight:800,fontSize:16,color:'#E65100',letterSpacing:'2px'}}>{offer.couponCode}</span>
                    </div>
                  )}
                  {offer.validUntil && (
                    <div className="offer-expiry">
                      ⏳ Valid until: {new Date(offer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                  <Link to="/products" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>
                    Shop Now & Save
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="offers-cta">
          <h3>Want a Custom Quote?</h3>
          <p>Contact us directly for bulk orders, special discounts and personalised pricing.</p>
          <Link to="/contact" className="btn-outline">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
