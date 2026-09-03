import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, loadDelivery } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { getSettings, getActiveOffers, validateCoupon } from '../utils/api';
import { STATE_NAMES, getDistricts, getDistrictCoords } from '../utils/indiaLocations';
import './CartPage.css';

const DEFAULT_SHOP_LAT = 30.22447;
const DEFAULT_SHOP_LNG = 75.08144;

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Per-item sqft input — allows free editing, enter key commits
function CartItemInput({ item, updateSqft }) {
  const [val, setVal] = useState(String(item.squareFeet));
  useEffect(() => { setVal(String(item.squareFeet)); }, [item.squareFeet]);

  const commit = () => {
    const num = parseInt(val);
    if (!num || num < 1) setVal(String(item.squareFeet));
    else updateSqft(item._id, num);
  };

  return (
    <div className="sqft-control">
      <button onClick={() => { const n = Math.max(1, item.squareFeet-5); updateSqft(item._id,n); setVal(String(n)); }}>−</button>
      <input type="number" value={val} min="1"
        onChange={e => { const v=e.target.value; if(v===''||/^[0-9]+$/.test(v)) setVal(v); }}
        onBlur={commit}
        onKeyDown={e => { if(e.key==='Enter'){e.preventDefault(); commit(); e.target.blur(); }}}
      />
      <button onClick={() => { const n=item.squareFeet+5; updateSqft(item._id,n); setVal(String(n)); }}>+</button>
    </div>
  );
}

export default function CartPage() {
  const { items, removeFromCart, updateSqft, subtotal, clearCart } = useCart();
  const { isLoggedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/cart' } });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  const [cfg, setCfg] = useState({
    labour_rate_per_sqft:2, transport_base_charge:250,
    transport_light_per_km:15, transport_heavy_per_km:22,
    transport_heavy_sqft_threshold:400, tile_weight_per_sqft_kg:2.2,
    shop_lat:DEFAULT_SHOP_LAT, shop_lng:DEFAULT_SHOP_LNG,
  });
  const [offers, setOffers]             = useState([]);
  const [couponCode, setCouponCode]     = useState('');
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [couponMsg, setCouponMsg]       = useState('');
  const [couponError, setCouponError]   = useState('');

  // Delivery location — only restore from localStorage if cart has items
  const savedDelivery = items.length > 0 ? loadDelivery() : { selState:'', selDistrict:'', distanceKm:null, distanceNote:'' };
  const [selState, setSelState]         = useState(savedDelivery.selState || '');
  const [selDistrict, setSelDistrict]   = useState(savedDelivery.selDistrict || '');
  const [geoStatus, setGeoStatus]       = useState(savedDelivery.distanceKm ? 'done' : 'idle');
  const [distanceKm, setDistanceKm]     = useState(savedDelivery.distanceKm || null);
  const [distanceNote, setDistanceNote] = useState(savedDelivery.distanceNote || '');

  useEffect(() => {
    getSettings().then(r => setCfg(r.data)).catch(() => {});
    getActiveOffers().then(r => setOffers(r.data)).catch(() => {});
  }, []);

  // Persist delivery info to localStorage whenever it changes
  useEffect(() => {
    try { localStorage.setItem('tilehouse_delivery', JSON.stringify({ selState, selDistrict, distanceKm, distanceNote })); } catch {}
  }, [selState, selDistrict, distanceKm, distanceNote]);

  // ── Charge calculations ─────────────────────────────────
  const totalSqft      = items.reduce((s,i) => s + i.squareFeet, 0);
  const totalWeightKg  = Math.round(totalSqft * (cfg.tile_weight_per_sqft_kg||2.2));
  const labourCharge   = Math.round(totalSqft * (cfg.labour_rate_per_sqft||2));
  const isHeavyVehicle = totalSqft >= (cfg.transport_heavy_sqft_threshold||400);
  const ratePerKm      = isHeavyVehicle ? (cfg.transport_heavy_per_km||22) : (cfg.transport_light_per_km||15);

  const calcTransport = useCallback((km) => {
    if (!km||km<=0) return 0;
    let cost = cfg.transport_base_charge||250;
    if (km>5) cost += Math.round((km-5)*ratePerKm);
    return cost;
  }, [cfg, ratePerKm]);

  const transportCharge = distanceKm!=null ? calcTransport(distanceKm) : 0;

  // Recalculate transport whenever items change (vehicle type may change)
  useEffect(() => {
    if (distanceKm!=null) {
      // Force recalculate with new vehicle type
      setDistanceNote(prev => prev.replace(/Heavy vehicle|Light vehicle/, isHeavyVehicle ? 'Heavy vehicle 🚛' : 'Light vehicle 🛻'));
    }
  // eslint-disable-next-line
  }, [totalSqft, isHeavyVehicle]);

  let discountAmount = 0;
  if (appliedOffer) {
    discountAmount = appliedOffer.type==='percent'
      ? Math.round((subtotal+labourCharge+transportCharge)*appliedOffer.discountPercent/100)
      : (appliedOffer.discountAmount||0);
  }
  const grandTotal = subtotal + labourCharge + transportCharge - discountAmount;

  // ── Distance calculation ────────────────────────────────
  const calculateDistance = async () => {
    if (!selState||!selDistrict) return;
    setGeoStatus('loading'); setDistanceNote('');
    const shopLat = parseFloat(cfg.shop_lat||DEFAULT_SHOP_LAT);
    const shopLng = parseFloat(cfg.shop_lng||DEFAULT_SHOP_LNG);

    const coords = getDistrictCoords(selState, selDistrict);
    if (coords) {
      const road = Math.round(haversineKm(shopLat,shopLng,coords.lat,coords.lng)*1.3*10)/10;
      setDistanceKm(road);
      setDistanceNote(`📍 ${selDistrict}, ${selState} · ~${road} km · ${isHeavyVehicle?'Heavy vehicle 🚛':'Light vehicle 🛻'}`);
      setGeoStatus('done');
    } else {
      try {
        const q = encodeURIComponent(`${selDistrict} district, ${selState}, India`);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=in`,{headers:{'Accept-Language':'en'}});
        const data = await res.json();
        if (data&&data.length>0) {
          const road = Math.round(haversineKm(shopLat,shopLng,parseFloat(data[0].lat),parseFloat(data[0].lon))*1.3*10)/10;
          setDistanceKm(road);
          setDistanceNote(`📍 ${selDistrict}, ${selState} · ~${road} km · ${isHeavyVehicle?'Heavy vehicle 🚛':'Light vehicle 🛻'}`);
          setGeoStatus('done');
        } else { setGeoStatus('error'); setDistanceNote('Could not find location. Please check district.'); }
      } catch { setGeoStatus('error'); setDistanceNote('Network error. Transport confirmed on call.'); }
    }
  };

  const handleStateChange = (s) => { setSelState(s); setSelDistrict(''); setDistanceKm(null); setDistanceNote(''); setGeoStatus('idle'); };
  const handleDistrictChange = (d) => { setSelDistrict(d); setDistanceKm(null); setDistanceNote(''); setGeoStatus('idle'); };

  // ── Coupon ──────────────────────────────────────────────
  const applyCoupon = async () => {
    setCouponError(''); setCouponMsg('');
    if (!couponCode.trim()) { setCouponError('Enter a coupon code'); return; }
    try {
      const res = await validateCoupon(couponCode.trim().toUpperCase());
      const offerData = res.data;
      setAppliedOffer(offerData);
      setCouponMsg(`✓ "${offerData.title}" applied!`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid or expired coupon code';
      setCouponError(msg);
      setAppliedOffer(null);
    }
  };
  const removeCoupon = () => { setAppliedOffer(null); setCouponCode(''); setCouponMsg(''); setCouponError(''); };

  if (items.length===0) return (
    <div className="cart-page"><div className="container"><div className="cart-empty">
      <div style={{fontSize:70}}>🛒</div>
      <h2>Your Cart is Empty</h2>
      <p>Browse our collection and add tiles to your cart</p>
      <Link to="/products" className="btn-primary">Start Shopping</Link>
    </div></div></div>
  );

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
        </div>
        <div className="cart-layout">

          {/* Items */}
          <div className="cart-items">
            {items.map(item => (
              <div className="cart-item" key={item._id}>
                <img src={item.image||'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=200'} alt={item.name}
                  onError={e=>{e.target.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200';}} />
                <div className="item-info">
                  <div className="item-company">{item.company}</div>
                  <h3>{item.name}</h3>
                  <div className="item-meta">📐 {item.dimensions} &nbsp;|&nbsp; {item.finish==='glossy'?'✨ Glossy':'🪨 Matte'} &nbsp;|&nbsp; {item.category==='floor'?'🏠 Floor':'🧱 Wall'}</div>
                  <div className="item-price-row">
                    <span className="item-rate">₹{item.pricePerSqFt}/sq.ft</span>
                    <CartItemInput item={item} updateSqft={updateSqft} />
                    <span className="item-unit">sq.ft</span>
                  </div>
                </div>
                <div className="item-right">
                  <div className="item-total">₹{(item.pricePerSqFt*item.squareFeet).toLocaleString('en-IN')}</div>
                  <button className="remove-btn" onClick={()=>removeFromCart(item._id)}>✕ Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>

            {/* Delivery location */}
            <div className="transport-section">
              <div className="transport-label">
                🚚 Delivery Location & Transport Estimate
                <span className="truck-note">{isHeavyVehicle?'🚛 Heavy vehicle':'🛻 Light vehicle'} · ~{totalWeightKg} kg</span>
              </div>

              <div className="loc-row">
                <label>State *</label>
                <select value={selState} onChange={e=>handleStateChange(e.target.value)}>
                  <option value="">-- Select State --</option>
                  {STATE_NAMES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="loc-row">
                <label>District *</label>
                <select value={selDistrict} onChange={e=>handleDistrictChange(e.target.value)} disabled={!selState}>
                  <option value="">-- Select District --</option>
                  {getDistricts(selState).map(d=><option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
              </div>

              <button
                className={`geo-btn ${geoStatus==='loading'?'loading':''}`}
                onClick={calculateDistance}
                disabled={!selState||!selDistrict||geoStatus==='loading'}
                style={{width:'100%',marginTop:8}}
              >
                {geoStatus==='loading' ? '⏳ Calculating...' : geoStatus==='done' ? '🔄 Recalculate' : '📍 Calculate Transport'}
              </button>

              {distanceNote && (
                <div className={`dist-note ${geoStatus==='error'?'error':'success'}`} style={{marginTop:8}}>
                  {distanceNote}
                </div>
              )}

              {distanceKm!=null&&distanceKm>0 && (
                <div className="transport-amount" style={{marginTop:8}}>
                  Transport estimate: <strong>₹{transportCharge.toLocaleString('en-IN')}</strong>
                  <span className="dist-badge">{distanceKm} km</span>
                </div>
              )}
              {distanceKm==null && (
                <div className="transport-note">Select state & district then click Calculate</div>
              )}
            </div>

            {/* Coupon */}
            <div className="coupon-section">
              <div className="coupon-label">🎟️ Have a coupon code?</div>
              {offers.filter(o=>o.active&&o.couponCode).length>0&&!appliedOffer && (
                <div className="available-coupons">
                  {offers.filter(o=>o.active&&o.couponCode).map(o=>(
                    <div key={o._id} className="avail-coupon-chip" onClick={()=>{setCouponCode(o.couponCode);setCouponError('');}}>
                      <span className="ac-code">{o.couponCode}</span>
                      <span className="ac-desc">{o.type==='percent'?`${o.discountPercent}% off`:`₹${o.discountAmount} off`}</span>
                    </div>
                  ))}
                  <div className="avail-coupon-hint">Tap a code to apply it</div>
                </div>
              )}
              {!appliedOffer ? (
                <>
                  <div className="coupon-row">
                    <input type="text" placeholder="Enter coupon code" value={couponCode}
                      onChange={e=>{setCouponCode(e.target.value.toUpperCase());setCouponError('');}}
                      onKeyDown={e=>e.key==='Enter'&&applyCoupon()} />
                    <button className="apply-btn" onClick={applyCoupon}>Apply</button>
                  </div>
                  {couponError&&<div className="coupon-error">{couponError}</div>}
                  {couponMsg&&<div className="coupon-success">{couponMsg}</div>}
                </>
              ) : (
                <div className="coupon-applied">
                  <div className="ca-text">
                    <span className="ca-icon">✓</span>
                    <div>
                      <div className="ca-title">{appliedOffer.title}</div>
                      <div className="ca-saving">You save ₹{discountAmount.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <button className="remove-coupon" onClick={removeCoupon}>✕</button>
                </div>
              )}
            </div>

            <div className="summary-divider" />
            <div className="summary-row"><span>Items Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className="summary-row">
              <span>Labour Charges<small>₹{cfg.labour_rate_per_sqft}/sq.ft × {totalSqft} sq.ft</small></span>
              <span>₹{labourCharge.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>Transportation{distanceKm>0&&<small>{distanceKm} km · {isHeavyVehicle?'Heavy':'Light'}</small>}</span>
              <span>{distanceKm>0?`₹${transportCharge.toLocaleString('en-IN')}`:<em style={{fontSize:11,color:'#e53935'}}>⚠ Select district above</em>}</span>
            </div>
            {appliedOffer&&(
              <div className="summary-row discount-row">
                <span>Coupon Discount<small>{appliedOffer.title}</small></span>
                <span>− ₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="summary-divider" />
            <div className="summary-total"><span>Grand Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span></div>
            {distanceKm==null&&<div className="total-note">* Calculate transport to get accurate total</div>}

            <button
              className="btn-primary checkout-btn"
              disabled={distanceKm==null}
              title={distanceKm==null?'Please select state & district and calculate transport first':''}
              onClick={()=>{
                if (!isLoggedIn) {
                  if (window.confirm('You need to login first to place an order.\n\nClick OK to go to the Login page.')) {
                    navigate('/login', { state: { from: '/cart' } });
                  }
                  return;
                }
                navigate('/checkout',{state:{subtotal,labourCharge,transportCharge,discountAmount,appliedOffer:appliedOffer?appliedOffer.title:null,grandTotal,distanceKm,totalSqft,totalWeightKg,selState,selDistrict,cfg}});
              }}
            >
              {distanceKm==null?'📍 Calculate Transport First':'Proceed to Checkout →'}
            </button>
            <Link to="/products" className="continue-shopping">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
