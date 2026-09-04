import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { placeOrder, getSettings } from '../utils/api';
import { STATE_NAMES, getDistricts, getDistrictCoords } from '../utils/indiaLocations';
import { getVillages } from '../utils/punjabVillages';
import './CheckoutPage.css';

const DEFAULT_SHOP_LAT = 30.22447;
const DEFAULT_SHOP_LNG = 75.08144;

function haversineKm(lat1,lng1,lat2,lng2) {
  const R=6371,dLat=((lat2-lat1)*Math.PI)/180,dLng=((lng2-lng1)*Math.PI)/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// ── Village Selector ─────────────────────────────────────
// For Punjab: shows a direct <select> dropdown with bundled village list
// For other states: shows a search input powered by Nominatim
function VillageSelector({ district, state, value, onChange }) {
  const bundled = getVillages(state, district); // array or null

  // ── Bundled dropdown (Punjab districts) ─────────────
  if (bundled) {
    return (
      <div className="village-select-wrap">
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          disabled={!district}
          className="village-select"
        >
          <option value="">-- Select Village / Town (Optional) --</option>
          {bundled.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        {value && (
          <button
            type="button"
            className="village-clear-btn"
            onClick={() => onChange('')}
            title="Clear"
          >✕</button>
        )}
      </div>
    );
  }

  // ── Nominatim live search (all other states) ─────────
  return <VillageNominatimSearch district={district} state={state} value={value} onChange={onChange} />;
}

function VillageNominatimSearch({ district, state, value, onChange }) {
  const [query,   setQuery]   = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const timerRef = useRef(null);
  const wrapRef  = useRef(null);

  useEffect(() => {
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Reset when district changes
  useEffect(() => { setQuery(''); setResults([]); setOpen(false); }, [district]);
  useEffect(() => { if (!value) setQuery(''); }, [value]);

  const search = (q) => {
    if (!q || q.length < 2 || !district) { setResults([]); setOpen(false); return; }
    setLoading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q+', '+district+', '+state+', India')}&format=json&limit=10&countrycodes=in&addressdetails=1`;
        const data = await (await fetch(url, { headers: { 'Accept-Language': 'en' } })).json();
        const seen = new Set();
        const unique = data
          .filter(r => ['village','town','suburb','hamlet','locality','neighbourhood','city','municipality','quarter'].includes(r.type) || r.class === 'place')
          .map(r => ({ name: r.display_name.split(',')[0].trim(), full: r.display_name }))
          .filter(r => { if (seen.has(r.name)) return false; seen.add(r.name); return true; })
          .slice(0, 8);
        setResults(unique);
        setOpen(unique.length > 0);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 450);
  };

  return (
    <div className="village-dropdown-wrap" ref={wrapRef}>
      <div className="village-input-row">
        <input type="text" className="village-input"
          placeholder={district ? `Type village/town in ${district} district...` : 'Select state & district first'}
          value={query} disabled={!district}
          onChange={e => { setQuery(e.target.value); search(e.target.value); if (!e.target.value) { onChange(''); setOpen(false); } }}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {loading && <span className="village-loading">⏳</span>}
        {query && (
          <button className="village-clear" type="button"
            onClick={() => { setQuery(''); onChange(''); setResults([]); setOpen(false); }}>✕</button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="village-results">
          {results.map((r, i) => (
            <div key={i} className="village-result-item"
              onClick={() => { setQuery(r.name); onChange(r.name); setOpen(false); }}>
              <span className="vr-name">{r.name}</span>
              <span className="vr-full">{r.full.slice(0, 70)}{r.full.length > 70 ? '...' : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Checkout Page ────────────────────────────────────
export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user, isLoggedIn } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    subtotal=0, labourCharge:cartLabour=0, transportCharge:cartTransport=0,
    discountAmount=0, appliedOffer=null, grandTotal:cartGrandTotal=0,
    distanceKm:cartDistanceKm=null, totalSqft=0, totalWeightKg=0,
    selState:cartState='', selDistrict:cartDistrict='', cfg:cartCfg={},
  } = location.state||{};

  const [cfg,setCfg] = useState(cartCfg);
  useEffect(()=>{ getSettings().then(r=>setCfg(r.data)).catch(()=>{}); },[]);

  // Load saved form from sessionStorage on refresh, pre-fill with user data
  const savedForm = (() => { try { const s=sessionStorage.getItem('checkout_form'); return s?JSON.parse(s):null; } catch{return null;} })();

  const [form,setForm] = useState(savedForm||{
    customerName: user?.name || '',
    phone:        user?.phone || '',
    email:        user?.email || '',
    address:'', landmark:'',
    village:'', district:cartDistrict||'', state:cartState||'Punjab', pincode:'', paymentMethod:'COD',
  });
  const [errors,setErrors] = useState({});
  const [loading,setLoading] = useState(false);

  // Distance state — restored from cart or sessionStorage
  const savedDist = (() => { try { const s=sessionStorage.getItem('checkout_dist'); return s?JSON.parse(s):null; } catch{return null;} })();
  const [distanceKm,setDistanceKm]     = useState(savedDist?.distanceKm??cartDistanceKm);
  const [geoStatus,setGeoStatus]       = useState((savedDist?.distanceKm||cartDistanceKm)?'done':'idle');
  const [distanceNote,setDistanceNote] = useState(savedDist?.distanceNote||'');
  const [geoError,setGeoError]         = useState('');

  // Persist form to sessionStorage
  useEffect(()=>{ try{sessionStorage.setItem('checkout_form',JSON.stringify(form));}catch{} },[form]);
  useEffect(()=>{ try{sessionStorage.setItem('checkout_dist',JSON.stringify({distanceKm,distanceNote}));}catch{} },[distanceKm,distanceNote]);

  const districts = form.state ? getDistricts(form.state) : [];

  // Charge calculations using cfg
  const isHeavyVehicle = totalSqft >= (cfg.transport_heavy_sqft_threshold||400);
  const ratePerKm      = isHeavyVehicle ? (cfg.transport_heavy_per_km||22) : (cfg.transport_light_per_km||15);
  const labourCharge   = Math.round(totalSqft * (cfg.labour_rate_per_sqft||2));

  const calcTransport = useCallback((km)=>{
    if(!km||km<=0) return 0;
    let cost=cfg.transport_base_charge||250;
    if(km>5) cost+=Math.round((km-5)*ratePerKm);
    return cost;
  },[cfg,ratePerKm]);

  const transportCharge = distanceKm!=null ? calcTransport(distanceKm) : 0;

  // Recalculate discount dynamically based on live totals
  // appliedOffer comes from cart via location.state — re-fetch to get fresh offer data
  const [activeOffers, setActiveOffers] = useState([]);
  useEffect(() => {
    import('../utils/api').then(api => api.getActiveOffers().then(r => setActiveOffers(r.data)).catch(()=>{}));
  }, []);

  // Find the applied offer object from live offers
  const appliedOfferObj = activeOffers.find(o =>
    appliedOffer && (o.title === appliedOffer || (o.couponCode && o.couponCode === appliedOffer) || (o.privateCouponCode && o.privateCouponCode === appliedOffer))
  );

  // Calculate discount live (updates when transport changes)
  const liveDiscount = appliedOfferObj
    ? (appliedOfferObj.type === 'percent'
        ? Math.round((subtotal + labourCharge + transportCharge) * appliedOfferObj.discountPercent / 100)
        : (appliedOfferObj.discountAmount || 0))
    : discountAmount; // fall back to cart-passed value

  const grandTotal = subtotal + labourCharge + transportCharge - liveDiscount;

  // Recalculate distance for new state/district/village
  const recalcDistance = useCallback(async(state,district,village)=>{
    if(!state||!district){setDistanceKm(null);setGeoStatus('idle');return;}
    setGeoStatus('loading'); setGeoError('');
    const shopLat=parseFloat(cfg.shop_lat||DEFAULT_SHOP_LAT);
    const shopLng=parseFloat(cfg.shop_lng||DEFAULT_SHOP_LNG);

    if(village&&village.trim()) {
      try {
        const q=encodeURIComponent(`${village.trim()}, ${district}, ${state}, India`);
        const data=await(await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=in`,{headers:{'Accept-Language':'en'}})).json();
        if(data&&data.length>0) {
          const road=Math.round(haversineKm(shopLat,shopLng,parseFloat(data[0].lat),parseFloat(data[0].lon))*1.3*10)/10;
          setDistanceKm(road); setDistanceNote(`~${road} km (${village.trim()}, ${district})`); setGeoStatus('done'); return;
        }
      } catch{}
    }
    // Fallback to district coords
    const coords=getDistrictCoords(state,district);
    if(coords) {
      const road=Math.round(haversineKm(shopLat,shopLng,coords.lat,coords.lng)*1.3*10)/10;
      setDistanceKm(road); setDistanceNote(`~${road} km (${district} district)`); setGeoStatus('done');
    } else {
      setDistanceKm(null); setGeoStatus('error'); setGeoError('Could not calculate distance. Transport confirmed by our team.');
    }
  },[cfg]);

  const handleStateChange = (val)=>{ setForm(f=>({...f,state:val,district:'',village:''})); setDistanceKm(null);setGeoStatus('idle');setDistanceNote(''); };
  const handleDistrictChange = (val)=>{ setForm(f=>({...f,district:val,village:''})); recalcDistance(form.state,val,''); };

  const handleChange = (e)=>{
    const {name,value}=e.target;
    if(name==='phone'){
      if(value&&!/^[0-9]*$/.test(value)) return;
      // Block if first digit is 0,1,2,3,4,5
      if(value.length===1&&/^[0-5]/.test(value)) return;
    }
    if(name==='pincode'){
      if(value&&!/^[0-9]*$/.test(value)) return;
      if(value.length===1&&value==='0') return;
    }
    setForm(f=>({...f,[name]:value}));
    setErrors(err=>({...err,[name]:''}));
  };

  // ── Validation ──────────────────────────────────────────
  const validate = ()=>{
    const e={};
    if(!form.customerName.trim()||form.customerName.trim().length<2) e.customerName='Enter full name (min 2 characters)';
    else if(!/^[a-zA-Z\s.'\-]+$/.test(form.customerName.trim())) e.customerName='Name should contain letters only';
    if(!/^[6-9][0-9]{9}$/.test(form.phone.replace(/\s+/g,''))) e.phone='Enter valid 10-digit mobile number (must start with 6, 7, 8 or 9)';
    if(!form.email.trim()) e.email='Email is required for order confirmation';
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email='Enter a valid email address';
    if(!form.address.trim()||form.address.trim().length<10) e.address='Enter complete address (min 10 characters)';
    if(!form.district.trim()) e.district='Select your district';
    if(!form.state) e.state='Select your state';
    if(!/^[1-9][0-9]{5}$/.test(form.pincode)) e.pincode='Enter valid 6-digit pincode (cannot start with 0)';
    if(distanceKm==null) e.transport='Transport distance not calculated. Please check state/district.';
    return e;
  };

  // Check if form is complete enough to enable Place Order
  const isFormValid = ()=>{
    const phoneOk = /^[6-9][0-9]{9}$/.test(form.phone.replace(/\s+/g,''));
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    return form.customerName.trim().length>=2 && phoneOk &&
      emailOk &&
      form.address.trim().length>=10 && form.district && form.state &&
      /^[1-9][0-9]{5}$/.test(form.pincode) && distanceKm!=null;
  };

  const handleSubmit=async()=>{
    // Must be logged in to place order
    if (!isLoggedIn) {
      alert('Please sign in or create an account to place your order.\n\nClick OK to go to the login page.');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    const e=validate();
    if(Object.keys(e).length>0){
      setErrors(e);
      setTimeout(()=>{const el=document.querySelector('.form-error');if(el)el.scrollIntoView({behavior:'smooth',block:'center'});},100);
      return;
    }
    setLoading(true);
    try {
      const orderData={
        userId: user?._id || user?.id || null,
        customerName:form.customerName.trim(), phone:form.phone.replace(/\s+/g,''),
        email:form.email.trim(), address:form.address.trim(), landmark:form.landmark.trim(),
        village:form.village.trim(), district:form.district, state:form.state, pincode:form.pincode,
        paymentMethod:form.paymentMethod,
        items:items.map(i=>({productId:i._id,name:i.name,company:i.company,dimensions:i.dimensions,pricePerSqFt:i.pricePerSqFt,squareFeet:i.squareFeet,totalPrice:i.pricePerSqFt*i.squareFeet})),
        subtotal, transportationCharge:transportCharge, labourCharge,
        discount:liveDiscount, couponApplied:appliedOffer||'',
        distanceKm:distanceKm||0, totalSqft, totalWeightKg, totalAmount:grandTotal, distanceNote,
      };
      const res=await placeOrder(orderData);
      clearCart();
      try{sessionStorage.removeItem('checkout_form');sessionStorage.removeItem('checkout_dist');}catch{}
      navigate('/order-success',{state:{orderId:res.data.orderId,form,grandTotal}});
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to place order. Please try again.');
    }
    finally{ setLoading(false); }
  };

  if(items.length===0){navigate('/cart');return null;}

  // Redirect to login if not logged in
  if(!isLoggedIn) {
    return (
      <div className="checkout-page">
        <div className="container" style={{paddingTop:60,paddingBottom:60,textAlign:'center'}}>
          <div style={{fontSize:60,marginBottom:20}}>🔐</div>
          <h2 style={{marginBottom:12}}>Login Required</h2>
          <p style={{color:'var(--text-light)',marginBottom:28}}>Please login or create an account to place your order. Your cart is saved.</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <button className="btn-primary" onClick={()=>navigate('/login',{state:{from:'/checkout',cartState:location.state}})}>
              Login to Continue
            </button>
            <button className="btn-outline" onClick={()=>navigate('/register',{state:{from:'/checkout',cartState:location.state}})}>
              Create Account
            </button>
          </div>
          <p style={{marginTop:16,fontSize:13,color:'var(--text-light)'}}>
            Already on the login page? <a href="/cart" style={{color:'var(--primary)'}}>← Go back to Cart</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        {/* Back button */}
        <button className="checkout-back-btn" onClick={()=>navigate(-1)}>← Back to Cart</button>
        <h1>Checkout</h1>
        <div className="checkout-layout">
          <div className="checkout-form">

            <div className="form-section">
              <h3>📍 Delivery Address</h3>
              <div className="form-grid">

                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="e.g. Gurpreet Singh" />
                  {errors.customerName&&<span className="form-error">{errors.customerName}</span>}
                </div>

                <div className="form-group">
                  <label>Mobile Number * <small>(must start with 6–9)</small></label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} />
                  {errors.phone&&<span className="form-error">{errors.phone}</span>}
                </div>

                <div className="form-group full">
                  <label>Email *</label>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="yourname@email.com" type="email" required />
                  {errors.email&&<span className="form-error">{errors.email}</span>}
                </div>

                <div className="form-group full">
                  <label>Full Address * <small>(House No., Street, Mohalla/Colony)</small></label>
                  <textarea name="address" value={form.address} onChange={handleChange} placeholder="e.g. H.No. 45, Gali No. 3, New Colony..." rows={3} />
                  {errors.address&&<span className="form-error">{errors.address}</span>}
                </div>

                <div className="form-group full">
                  <label>Landmark <small>(Optional)</small></label>
                  <input name="landmark" value={form.landmark} onChange={handleChange} placeholder="e.g. Near Gurudwara, Opposite HDFC Bank..." />
                </div>

                {/* State */}
                <div className="form-group">
                  <label>State *</label>
                  <select name="state" value={form.state} onChange={e=>handleStateChange(e.target.value)}>
                    <option value="">-- Select State --</option>
                    {STATE_NAMES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state&&<span className="form-error">{errors.state}</span>}
                </div>

                {/* District */}
                <div className="form-group">
                  <label>District *</label>
                  <select name="district" value={form.district}
                    onChange={e=>{handleChange(e);handleDistrictChange(e.target.value);}} disabled={!form.state}>
                    <option value="">-- Select District --</option>
                    {districts.map(d=><option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                  {errors.district&&<span className="form-error">{errors.district}</span>}
                </div>

                {/* Village — Direct dropdown for Punjab, search for others */}
                <div className="form-group full">
                  <label>Village / Town <small>(Optional — improves transport accuracy)</small></label>
                  <VillageSelector district={form.district} state={form.state} value={form.village}
                    onChange={val => { setForm(f => ({...f, village: val})); recalcDistance(form.state, form.district, val); }} />
                </div>

                {/* Distance status */}
                {(geoStatus==='loading'||distanceNote||geoError||errors.transport)&&(
                  <div className="form-group full">
                    {geoStatus==='loading'&&<div className="geo-loading">⏳ Calculating distance...</div>}
                    {distanceNote&&geoStatus==='done'&&(
                      <div className="geo-success-box">
                        📍 Delivery distance: <strong>{distanceNote}</strong>
                        {' · '}Transport: <strong>₹{transportCharge.toLocaleString('en-IN')}</strong>
                        {' '}({isHeavyVehicle?'Heavy vehicle 🚛':'Light vehicle 🛻'})
                      </div>
                    )}
                    {(geoError||errors.transport)&&<div className="form-error">{geoError||errors.transport}</div>}
                  </div>
                )}

                {/* Pincode */}
                <div className="form-group full">
                  <label>Pincode *</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6} />
                  {errors.pincode&&<span className="form-error">{errors.pincode}</span>}
                </div>

              </div>
            </div>

            {/* Payment */}
            <div className="form-section">
              <h3>💳 Payment Method</h3>
              <div className="payment-options">
                {[{value:'COD',label:'Cash on Delivery',icon:'💵',desc:'Pay when you receive the order'},
                  {value:'UPI',label:'UPI / Online Payment',icon:'📱',desc:'Pay via UPI, PhonePe, GPay etc.'},
                  {value:'Bank',label:'Bank Transfer / NEFT',icon:'🏦',desc:'Transfer to our bank account'}].map(opt=>(
                  <label className={`payment-option ${form.paymentMethod===opt.value?'selected':''}`} key={opt.value}>
                    <input type="radio" name="paymentMethod" value={opt.value} checked={form.paymentMethod===opt.value} onChange={handleChange} />
                    <div className="pay-icon">{opt.icon}</div>
                    <div><strong>{opt.label}</strong><p>{opt.desc}</p></div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h3>Order Review</h3>
            <div className="order-items">
              {items.map(item=>(
                <div className="order-item" key={item._id}>
                  <img src={item.image} alt={item.name} onError={e=>{e.target.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100';}} />
                  <div>
                    <div className="oi-name">{item.name}</div>
                    <div className="oi-meta">{item.squareFeet} sq.ft × ₹{item.pricePerSqFt}</div>
                  </div>
                  <div className="oi-total">₹{(item.pricePerSqFt*item.squareFeet).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            <div className="summary-breakdown">
              <div className="sb-row"><span>Items Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="sb-row">
                <span>Labour <small>(₹{cfg.labour_rate_per_sqft||2}/sq.ft × {totalSqft} sq.ft)</small></span>
                <span>₹{labourCharge.toLocaleString('en-IN')}</span>
              </div>
              <div className="sb-row">
                <span>Transport{distanceKm>0&&<small>{distanceKm} km · {isHeavyVehicle?'Heavy':'Light'}</small>}</span>
                <span>{distanceKm>0?`₹${transportCharge.toLocaleString('en-IN')}`:<em style={{fontSize:11,color:'#e53935'}}>⚠ Select district</em>}</span>
              </div>
              {liveDiscount>0&&(
                <div className="sb-row" style={{color:'#2E7D32'}}>
                  <span>Discount {appliedOffer&&`(${appliedOffer})`}</span>
                  <span>− ₹{liveDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="sb-divider"/>
              <div className="sb-total"><span>Total Payable</span><span>₹{grandTotal.toLocaleString('en-IN')}</span></div>
              <div className="co-note">🔔 Our team will call to confirm delivery. Transport may be adjusted before dispatch.</div>
            </div>

            {!isLoggedIn && (
              <div className="login-required-note">
                🔐 Please <button onClick={()=>navigate('/login',{state:{from:'/checkout'}})} className="login-inline-btn">Sign In</button> or <button onClick={()=>navigate('/register')} className="login-inline-btn">Create Account</button> to place your order
              </div>
            )}

            {isLoggedIn && !isFormValid()&&(
              <div className="form-incomplete-note">
                ⚠ Fill all required fields to place order
              </div>
            )}

            <button className="btn-primary place-order-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading?'Placing Order...':`✓ Place Order — ₹${grandTotal.toLocaleString('en-IN')}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
