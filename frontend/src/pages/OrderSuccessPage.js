import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './OrderSuccessPage.css';

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const { orderId, form, grandTotal } = state || {};
  const { isLoggedIn } = useUser();

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h1>Order Placed Successfully!</h1>
        <p className="success-msg">Thank you, <strong>{form?.customerName}</strong>! Your order has been received.</p>
        {orderId && <div className="order-id">Order ID: <strong>#{String(orderId).slice(-8).toUpperCase()}</strong></div>}
        <div className="success-details">
          <div className="sd-row"><span>Total Amount</span><strong>₹{grandTotal?.toLocaleString('en-IN')}</strong></div>
          <div className="sd-row"><span>Payment</span><strong>{form?.paymentMethod}</strong></div>
          <div className="sd-row"><span>Delivery To</span><strong>{form?.district || form?.city} — {form?.pincode}</strong></div>
        </div>
        <div className="success-note">
          📞 Our team will call you at <strong>{form?.phone}</strong> within 24 hours to confirm your order and delivery schedule.
        </div>
        <div className="success-actions">
          {isLoggedIn && <Link to="/my-orders" className="btn-primary">📦 View My Orders</Link>}
          <Link to="/products" className={isLoggedIn ? 'btn-outline' : 'btn-primary'}>Continue Shopping</Link>
          <Link to="/" className="btn-outline">Go to Home</Link>
        </div>
      </div>
    </div>
  );
}
