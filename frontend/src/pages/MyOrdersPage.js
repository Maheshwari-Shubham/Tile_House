import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getMyOrders } from '../utils/api';
import './MyOrdersPage.css';

const STATUS = {
  pending:          { bg:'#FFF3E0', color:'#E65100', label:'⏳ Pending' },
  confirmed:        { bg:'#E3F2FD', color:'#1565C0', label:'✅ Confirmed' },
  out_for_delivery: { bg:'#F3E5F5', color:'#6A1B9A', label:'🚚 Out for Delivery' },
  delivered:        { bg:'#E8F5E9', color:'#2E7D32', label:'✓ Delivered' },
};

export default function MyOrdersPage() {
  const { user, isLoggedIn, logout } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login', { state: { from: '/my-orders' } }); return; }
    getMyOrders().then(r => setOrders(r.data)).catch(()=>setOrders([])).finally(()=>setLoading(false));
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return (
    <div className="myorders-page">
      <div className="container">
        <div className="myorders-header">
          <div>
            <h1>My Orders</h1>
            <p>
              Welcome,{' '}
              <strong
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setShowLogout(prev => !prev)}
              >
                {user?.name}
              </strong>{' '}
              · {user?.phone}
            </p>
            {showLogout && (
              <button
                className="logout-user-btn"
                onClick={() => { logout(); navigate('/'); }}
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {loading ? <div className="spinner" /> : orders.length===0 ? (
          <div className="no-orders">
            <div style={{fontSize:64}}>📦</div>
            <h3>No Orders Yet</h3>
            <p>You haven't placed any orders yet.</p>
            <Link to="/products" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="orders-list-user">
            {orders.map(o => {
              const st = STATUS[o.status]||STATUS.pending;
              const isOpen = expanded===o._id;
              return (
                <div className="order-card-user" key={o._id}>
                  <div className="ocu-header" onClick={()=>setExpanded(isOpen?null:o._id)}>
                    <div className="ocu-left">
                      <div className="ocu-id">Order #{String(o._id).slice(-8).toUpperCase()}</div>
                      <div className="ocu-date">{new Date(o.createdAt).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'long',year:'numeric'})}</div>
                      <div className="ocu-meta">{o.items?.length} item{o.items?.length!==1?'s':''} · {o.totalSqft} sq.ft · {o.paymentMethod}</div>
                    </div>
                    <div className="ocu-right">
                      <div className="ocu-amount">₹{o.totalAmount?.toLocaleString('en-IN')}</div>
                      <span className="ocu-status-badge" style={{background:st.bg,color:st.color}}>{st.label}</span>
                      <span className="ocu-chevron">{isOpen?'▲':'▼'}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="ocu-body">
                      {/* Items */}
                      <div className="ocu-section">
                        <div className="ocu-stitle">🧱 Items Ordered</div>
                        {o.items?.map((item,i) => (
                          <div className="ocu-item-row" key={i}>
                            <div className="ocu-item-info">
                              <span className="ocu-item-name">{item.name}</span>
                              <span className="ocu-item-meta">{item.company} · {item.dimensions}</span>
                            </div>
                            <div className="ocu-item-right">
                              <span>{item.squareFeet} sq.ft × ₹{item.pricePerSqFt}</span>
                              <strong>₹{item.totalPrice?.toLocaleString('en-IN')}</strong>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Charges */}
                      <div className="ocu-section">
                        <div className="ocu-stitle">💰 Bill Summary</div>
                        <div className="ocu-bill">
                          <div className="ocu-bill-row"><span>Tiles Subtotal</span><span>₹{o.subtotal?.toLocaleString('en-IN')}</span></div>
                          <div className="ocu-bill-row"><span>Labour</span><span>₹{(o.adminLabourOverride??o.labourCharge)?.toLocaleString('en-IN')}</span></div>
                          <div className="ocu-bill-row"><span>Transport{o.distanceKm>0?` (${o.distanceKm} km)`:''}</span><span>₹{(o.adminTransportOverride??o.transportationCharge)?.toLocaleString('en-IN')}</span></div>
                          {o.discount>0 && <div className="ocu-bill-row" style={{color:'#2E7D32'}}><span>Discount{o.couponApplied?` (${o.couponApplied})`:''}</span><span>−₹{o.discount?.toLocaleString('en-IN')}</span></div>}
                          <div className="ocu-bill-row total"><span>Total Paid</span><span>₹{o.totalAmount?.toLocaleString('en-IN')}</span></div>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="ocu-section">
                        <div className="ocu-stitle">📍 Delivery Address</div>
                        <div className="ocu-addr">
                          {o.address}{o.landmark?', '+o.landmark:''}<br/>
                          {o.village?o.village+', ':''}{o.district}, {o.state} — {o.pincode}
                        </div>
                      </div>

                      {/* Driver */}
                      {o.status==='out_for_delivery' && (o.driverName||o.driverPhone) && (
                        <div className="ocu-section driver-box">
                          <div className="ocu-stitle">🚛 Your Delivery Driver</div>
                          {o.driverName && <div className="driver-name">{o.driverName}</div>}
                          {o.driverPhone && (
                            <a href={`tel:${o.driverPhone}`} className="driver-call">📞 Call Driver: {o.driverPhone}</a>
                          )}
                        </div>
                      )}

                      {/* Admin note */}
                      {o.adminNote && (
                        <div className="ocu-section" style={{background:'#FFF8E1',border:'1px solid #FFE082'}}>
                          <div className="ocu-stitle">📝 Note from Tile House</div>
                          <div style={{fontSize:14,color:'#555'}}>{o.adminNote}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
