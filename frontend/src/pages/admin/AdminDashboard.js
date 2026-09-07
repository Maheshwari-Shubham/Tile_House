import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  uploadProductImage,
  getOrders, updateOrderStatus,
  getFullSettings, updateSetting, testEmail,
  getAllOffers, createOffer, updateOffer, deleteOffer,
} from '../../utils/api';
import { downloadInvoice } from '../../utils/invoice';
import './AdminDashboard.css';

const TABS = ['Dashboard', 'Products', 'Orders', 'Offers', 'Settings'];

const getSampleProducts = (products) => products.filter((product, index) =>
  products.slice(0, index).filter(previous => previous.company === product.company).length < 5
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [offers, setOffers]     = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem('adminToken');
  const user  = localStorage.getItem('adminUser');

  useEffect(() => { if (!token) navigate('/admin/login'); }, [token, navigate]);

  const clearAdminStorage = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const selectTab = (t) => {
    setTab(t);
    setMobileMenuOpen(false);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [p, o, q, s] = await Promise.all([
        getProducts(), getOrders(), getAllOffers(), getFullSettings(),
      ]);
      setProducts(p.data);
      setOrders(o.data);
      setOffers(q.data);
      setSettings(s.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load data';
      console.error('Failed to load admin data:', errorMsg, err);
      setError(errorMsg);
      if (err.response?.status === 401) {
        clearAdminStorage();
        navigate('/admin/login');
      }
    } finally { 
      setLoading(false); 
    }
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const logout = () => { clearAdminStorage(); navigate('/admin/login'); };

  const totalRevenue  = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-brand">
          <img src="/favicon.svg" alt="Tile House logo" className="admin-brand-mark" />
          <div>
            <div>Tile House</div>
            <span>Admin</span>
          </div>
        </div>
        <nav className="admin-nav">
          {TABS.map(t => (
            <button key={t} className={`admin-nav-btn ${tab === t ? 'active' : ''}`} onClick={() => selectTab(t)}>
              {t === 'Dashboard' && '📊'} {t === 'Products' && '🗂️'} {t === 'Orders' && '📦'} {t === 'Offers' && '🎁'} {t} {t === 'Settings' && '⚙️'}
              {t === 'Orders' && pendingOrders > 0 && <span className="nav-badge">{pendingOrders}</span>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user">👤 {user}</div>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </aside>
      <div className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)} />

      <main className="admin-main">
        <div className="admin-topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(prev => !prev)}>☰ Menu</button>
            <h2>{tab}</h2>
          </div>
          <a href="/" target="_blank" rel="noreferrer" className="view-site-btn">View Website ↗</a>
        </div>
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '4px', margin: '16px', fontSize: '14px' }}>{error}</div>}
        {loading && <div className="spinner" />}
        {!loading && tab === 'Dashboard' && <DashboardTab products={getSampleProducts(products)} orders={orders} totalRevenue={totalRevenue} pendingOrders={pendingOrders} />}
        {!loading && tab === 'Products'  && <ProductsTab products={products} onRefresh={loadData} />}
        {!loading && tab === 'Orders'    && <OrdersTab orders={orders} onRefresh={loadData} />}
        {!loading && tab === 'Offers'    && <OffersTab offers={offers} onRefresh={loadData} />}
        {!loading && tab === 'Settings'  && <SettingsTab settings={settings} onRefresh={loadData} />}
      </main>
    </div>
  );
}

// ── Image Uploader Component ─────────────────────────────
// Admin can pick an image from device → uploads to Cloudinary → returns URL
function ImageUploader({ currentImage, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const [preview, setPreview]     = useState(currentImage || '');
  const fileRef                   = useRef(null);

  // Sync preview if parent updates currentImage (e.g. editing existing product)
  useEffect(() => { setPreview(currentImage || ''); }, [currentImage]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setError('');
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await uploadProductImage(fd);
      const cloudUrl = res.data.url;
      setPreview(cloudUrl);
      onUpload(cloudUrl);
      URL.revokeObjectURL(localUrl);
    } catch (err) {
      setError('Upload failed: ' + (err.response?.data?.error || err.message));
      setPreview(currentImage || '');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-uploader">
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      {/* Preview area */}
      <div className="iu-preview-wrap" onClick={() => !uploading && fileRef.current?.click()}>
        {preview ? (
          <img src={preview} alt="Product" className="iu-preview-img" />
        ) : (
          <div className="iu-placeholder">
            <span style={{fontSize:32}}>📷</span>
            <span>Click to upload image</span>
            <span className="iu-hint">JPG, PNG or WEBP · max 10 MB</span>
          </div>
        )}
        {uploading && (
          <div className="iu-overlay">
            <div className="iu-spinner" />
            <span>Uploading...</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="iu-actions">
        <button
          type="button"
          className="iu-btn-upload"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? '⏳ Uploading...' : preview ? '🔄 Change Image' : '📁 Choose Image'}
        </button>
        {preview && !uploading && (
          <button
            type="button"
            className="iu-btn-remove"
            onClick={() => { setPreview(''); onUpload(''); }}
          >
            ✕ Remove
          </button>
        )}
      </div>

      {error && <div className="iu-error">{error}</div>}

      {/* Also allow pasting a URL as fallback */}
      <div className="iu-url-fallback">
        <span>Or paste image URL:</span>
        <input
          type="text"
          placeholder="https://example.com/image.jpg"
          value={preview.startsWith('blob:') ? '' : preview}
          onChange={e => { setPreview(e.target.value); onUpload(e.target.value); }}
        />
      </div>
    </div>
  );
}

/* ── DASHBOARD ── */
function DashboardTab({ products, orders, totalRevenue, pendingOrders }) {
  const recent = [...orders].slice(0, 5);
  return (
    <div className="tab-content">
      <div className="stats-grid">
        {[
          { label:'Total Products',  value:products.length,                          icon:'🗂️', color:'#E3F2FD' },
          { label:'Total Orders',    value:orders.length,                            icon:'📦', color:'#F3E5F5' },
          { label:'Pending Orders',  value:pendingOrders,                            icon:'⏳', color:'#FFF3E0' },
          { label:'Total Revenue',   value:`₹${totalRevenue.toLocaleString('en-IN')}`,icon:'💰', color:'#E8F5E9' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{background:s.color}}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-val">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="recent-orders-section">
        <h3>Recent Orders</h3>
        <table className="admin-table">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {recent.map(o => (
              <tr key={o._id}>
                <td><code>#{String(o._id).slice(-8).toUpperCase()}</code></td>
                <td><strong>{o.customerName}</strong><br/><small>{o.phone}</small></td>
                <td><strong>₹{o.totalAmount?.toLocaleString('en-IN')}</strong></td>
                <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── PRODUCTS ── */
function ProductsTab({ products, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [filterCat, setFilterCat] = useState('All');
  const [saving, setSaving] = useState(false);
  const emptyForm = { name:'', company:'Somany', category:'floor', finish:'matte', sizeGroup:'medium', dimensions:'600x600 mm', pricePerSqFt:'', stockSquareFeet:0, image:'', description:'', inStock:true, featured:false };
  const [form, setForm] = useState(emptyForm);

  const openAdd  = () => { setForm(emptyForm); setEditProduct(null); setShowForm(true); };
  const openEdit = (p) => { setForm({...p}); setEditProduct(p._id); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editProduct) await updateProduct(editProduct, form);
      else await createProduct(form);
      setShowForm(false); onRefresh();
    } catch (err) { alert(err.response?.data?.error || 'Error saving product'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await deleteProduct(id); onRefresh();
  };

  const filtered = filterCat === 'All' ? products : products.filter(p => p.category === filterCat);

  return (
    <div className="tab-content">
      <div className="tab-actions">
        <div className="tab-filters">
          {['All','floor','wall'].map(c => (
            <button key={c} className={filterCat===c?'active':''} onClick={() => setFilterCat(c)}>{c}</button>
          ))}
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>
      <table className="admin-table">
        <thead><tr><th>Image</th><th>Name</th><th>Company</th><th>Category</th><th>Finish</th><th>Size</th><th>Price/sqft</th><th>Stock</th><th>Actions</th></tr></thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p._id}>
              <td><img src={p.image} alt={p.name} style={{width:52,height:44,objectFit:'cover',borderRadius:6}} onError={e=>{e.target.style.display='none';}} /></td>
              <td><strong>{p.name}</strong></td>
              <td>{p.company}</td>
              <td><span className={`badge badge-${p.category}`}>{p.category}</span></td>
              <td><span className={`badge badge-${p.finish}`}>{p.finish}</span></td>
              <td>{p.dimensions}</td>
              <td><strong style={{color:'var(--primary)'}}>₹{p.pricePerSqFt}</strong></td>
              <td><span style={{color:p.inStock && p.stockSquareFeet > 0?'var(--success)':'var(--danger)',fontWeight:600}}>{p.stockSquareFeet ?? 'Not set'} sq.ft</span></td>
              <td>
                <button className="tbl-btn edit" onClick={() => openEdit(p)}>✏️ Edit</button>
                <button className="tbl-btn del"  onClick={() => handleDelete(p._id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="fg"><label>Product Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
                <div className="fg"><label>Company</label>
                  <select value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))}>
                    {['Somany','Kajaria','Oasis','Local'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="fg"><label>Category</label>
                  <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                    <option value="floor">Floor</option><option value="wall">Wall</option>
                  </select>
                </div>
                <div className="fg"><label>Finish</label>
                  <select value={form.finish} onChange={e=>setForm(f=>({...f,finish:e.target.value}))}>
                    <option value="matte">Matte</option><option value="glossy">Glossy</option>
                  </select>
                </div>
                <div className="fg"><label>Size Group</label>
                  <select value={form.sizeGroup||'medium'} onChange={e=>setForm(f=>({...f,sizeGroup:e.target.value}))}>
                    <option value="small">🚿 Small — Walls/Bathrooms</option>
                    <option value="medium">🏠 Medium — Standard Floor</option>
                    <option value="large">🏢 Large Format</option>
                    <option value="plank">🪵 Plank — Wood Look</option>
                    <option value="outdoor">☀️ Outdoor — Thick/Anti-Skid</option>
                  </select>
                </div>
                <div className="fg"><label>Dimensions</label><input value={form.dimensions} onChange={e=>setForm(f=>({...f,dimensions:e.target.value}))} placeholder="e.g. 600x600 mm" /></div>
                <div className="fg"><label>Price per Sq.Ft (₹)</label><input type="number" value={form.pricePerSqFt} onChange={e=>setForm(f=>({...f,pricePerSqFt:e.target.value}))} /></div>
                <div className="fg"><label>Available Stock (sq.ft)</label><input type="number" min="0" step="0.01" value={form.stockSquareFeet ?? 0} onChange={e=>setForm(f=>({...f,stockSquareFeet:e.target.value}))} /></div>
                <div className="fg full"><label>Product Image</label>
                  <ImageUploader
                    currentImage={form.image}
                    onUpload={(url) => setForm(f => ({ ...f, image: url }))}
                  />
                </div>
                <div className="fg full"><label>Description</label><textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>
                <div className="fg checkbox-row">
                  <label><input type="checkbox" checked={form.inStock} onChange={e=>setForm(f=>({...f,inStock:e.target.checked}))} /> In Stock</label>
                  <label><input type="checkbox" checked={form.featured} onChange={e=>setForm(f=>({...f,featured:e.target.checked}))} /> Featured</label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving...':'Save Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── ORDERS ── */
function OrdersTab({ orders, onRefresh }) {
  const [filter, setFilter]          = useState('all');
  const [expandedOrder, setExpanded] = useState(null);
  const [overrides, setOverrides]    = useState({}); // { orderId: { transport, labour, note, saving } }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const getOverride = (id) => overrides[id] || {};
  const setOverride = (id, key, val) => setOverrides(prev => ({
    ...prev, [id]: { ...prev[id], [key]: val }
  }));

  const saveOrder = async (o) => {
    const ov = getOverride(o._id);
    const newStatus = ov.status || o.status;

    // Fix 7: If setting to out_for_delivery, driver details required
    if (newStatus === 'out_for_delivery') {
      const dName  = ov.driverName  !== undefined ? ov.driverName  : (o.driverName  || '');
      const dPhone = ov.driverPhone !== undefined ? ov.driverPhone : (o.driverPhone || '');
      const dVehicle = ov.vehicleNumber !== undefined ? ov.vehicleNumber : (o.vehicleNumber || '');
      if (!dName.trim())  { alert('Please enter Driver Name before marking as Out for Delivery'); return; }
      if (!/^[6-9][0-9]{9}$/.test(dPhone)) { alert('Enter valid 10-digit driver mobile number (must start with 6–9) before marking as Out for Delivery'); return; }
      if (!dVehicle.trim()) { alert('Please enter Vehicle Number before marking as Out for Delivery'); return; }
    }

    setOverride(o._id, 'saving', true);
    try {
      const payload = { status: newStatus };
      if (ov.transport      !== undefined && ov.transport !== '')  payload.adminTransportOverride = parseFloat(ov.transport);
      if (ov.labour         !== undefined && ov.labour   !== '')  payload.adminLabourOverride    = parseFloat(ov.labour);
      if (ov.note           !== undefined) payload.adminNote      = ov.note;
      if (ov.driverName     !== undefined) payload.driverName     = ov.driverName;
      if (ov.driverPhone    !== undefined) payload.driverPhone    = ov.driverPhone;
      if (ov.vehicleNumber  !== undefined) payload.vehicleNumber  = ov.vehicleNumber;
      await updateOrderStatus(o._id, payload);
      onRefresh();
    } catch { alert('Error saving order'); }
    finally { setOverride(o._id, 'saving', false); }
  };

  return (
    <div className="tab-content">
      <div className="tab-actions">
        <div className="tab-filters">
          {['all','pending','confirmed','out_for_delivery','delivered'].map(s => (
            <button key={s} className={filter===s?'active':''} onClick={() => setFilter(s)}>
              {s === 'out_for_delivery' ? '🚚 Out for Delivery' : s}
            </button>
          ))}
        </div>
        <span style={{fontSize:13,color:'var(--text-light)'}}>{filtered.length} orders</span>
      </div>

      <div className="orders-list">
        {filtered.map(o => {
          const ov = getOverride(o._id);
          const effectiveTransport = ov.transport !== undefined && ov.transport !== ''
            ? parseFloat(ov.transport) : (o.adminTransportOverride != null ? o.adminTransportOverride : o.transportationCharge);
          const effectiveLabour = ov.labour !== undefined && ov.labour !== ''
            ? parseFloat(ov.labour) : (o.adminLabourOverride != null ? o.adminLabourOverride : o.labourCharge);
          const recalcTotal = o.subtotal + effectiveTransport + effectiveLabour - (o.discount || 0);

          return (
            <div className="order-card" key={o._id}>
              <div className="oc-header" onClick={() => setExpanded(expandedOrder===o._id ? null : o._id)}>
                <div className="oc-left">
                  <code className="oc-id">#{String(o._id).slice(-8).toUpperCase()}</code>
                  <div className="oc-name"><strong>{o.customerName}</strong> · {o.phone}</div>
                  <div className="oc-date">{new Date(o.createdAt).toLocaleString('en-IN')}</div>
                </div>
                <div className="oc-right">
                  <div className="oc-amount">₹{o.totalAmount?.toLocaleString('en-IN')}</div>
                  <span className={`status-badge status-${o.status}`}>{o.status}</span>
                    {o.status === 'delivered' && (
                      <button
                        className="tbl-btn edit invoice-download-btn"
                        type="button"
                        onClick={(event) => { event.stopPropagation(); downloadInvoice(o); }}
                      >
                        Download Invoice
                      </button>
                    )}
                  <span className="oc-chevron">{expandedOrder===o._id?'▲':'▼'}</span>
                </div>
              </div>

              {expandedOrder === o._id && (
                <div className="oc-body">

                  {/* Full delivery address */}
                  <div className="oc-section">
                    <div className="oc-section-title">📍 Complete Delivery Address</div>
                    <div className="oc-address-box">
                      <div className="oca-name">{o.customerName}</div>
                      <div className="oca-line">{o.address}</div>
                      {o.landmark && <div className="oca-line">Landmark: {o.landmark}</div>}
                      {o.village  && <div className="oca-line">Village/Town: <strong>{o.village}</strong></div>}
                      {o.district && <div className="oca-line">District: <strong>{o.district}</strong></div>}
                      <div className="oca-line">
                        {o.city}{o.district && o.district !== o.city ? `, ${o.district}` : ''}, {o.state} — {o.pincode}
                      </div>
                      <div className="oca-phone">📞 {o.phone}{o.email ? `  ✉️ ${o.email}` : ''}</div>
                      {o.distanceKm > 0 && (
                        <div className="oca-dist">
                          📏 {o.distanceKm} km from shop{o.distanceNote ? ` (${o.distanceNote})` : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="oc-section">
                    <div className="oc-section-title">🧱 Items ({o.totalSqft||'?'} sq.ft · {o.totalWeightKg||'?'} kg)</div>
                    <div className="oc-items-list">
                      {o.items?.map((item,i) => (
                        <div className="oci-row" key={i}>
                          <span>{item.name} ({item.company}) — {item.dimensions}</span>
                          <span>{item.squareFeet} sq.ft × ₹{item.pricePerSqFt} = <strong>₹{item.totalPrice?.toLocaleString('en-IN')}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Charges + Admin Override */}
                  <div className="oc-section">
                    <div className="oc-section-title">💰 Charges — Admin Can Override</div>
                    <div className="admin-override-grid">

                      <div className="ao-row">
                        <div className="ao-label">
                          Subtotal (tiles)
                        </div>
                        <div className="ao-value">₹{o.subtotal?.toLocaleString('en-IN')}</div>
                      </div>

                      <div className="ao-row">
                        <div className="ao-label">
                          Labour Charges
                          <small>System: ₹{o.labourCharge?.toLocaleString('en-IN')}{o.adminLabourOverride!=null ? ` · Admin set: ₹${o.adminLabourOverride}` : ''}</small>
                        </div>
                        <div className="ao-input">
                          <input
                            type="number" min="0" placeholder={`₹${o.adminLabourOverride ?? o.labourCharge}`}
                            value={ov.labour !== undefined ? ov.labour : ''}
                            onChange={e => setOverride(o._id,'labour',e.target.value)}
                          />
                          <span className="ao-hint">Override (₹)</span>
                        </div>
                      </div>

                      <div className="ao-row">
                        <div className="ao-label">
                          Transport Charges
                          <small>System: ₹{o.transportationCharge?.toLocaleString('en-IN')} ({o.distanceKm||0} km){o.adminTransportOverride!=null ? ` · Admin set: ₹${o.adminTransportOverride}` : ''}</small>
                        </div>
                        <div className="ao-input">
                          <input
                            type="number" min="0" placeholder={`₹${o.adminTransportOverride ?? o.transportationCharge}`}
                            value={ov.transport !== undefined ? ov.transport : ''}
                            onChange={e => setOverride(o._id,'transport',e.target.value)}
                          />
                          <span className="ao-hint">Override (₹)</span>
                        </div>
                      </div>

                      {o.discount > 0 && (
                        <div className="ao-row">
                          <div className="ao-label">Discount {o.couponApplied?`(${o.couponApplied})`:''}</div>
                          <div className="ao-value" style={{color:'#2E7D32'}}>−₹{o.discount?.toLocaleString('en-IN')}</div>
                        </div>
                      )}

                      <div className="ao-row total-row">
                        <div className="ao-label"><strong>Revised Total</strong></div>
                        <div className="ao-value"><strong>₹{recalcTotal.toLocaleString('en-IN')}</strong></div>
                      </div>

                      <div className="ao-row">
                        <div className="ao-label">Admin Note (optional)</div>
                        <div className="ao-input full">
                          <input type="text" placeholder="e.g. Transport revised due to extra distance"
                            value={ov.note !== undefined ? ov.note : (o.adminNote||'')}
                            onChange={e => setOverride(o._id,'note',e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Details */}
                  <div className="oc-section">
                    <div className="oc-section-title">🚛 Driver & Vehicle Details <small style={{color:'#E65100'}}>(Required when marking Out for Delivery)</small></div>
                    <div className="admin-override-grid">
                      <div className="ao-row">
                        <div className="ao-label">Driver Name *{o.driverName && <small>Current: {o.driverName}</small>}</div>
                        <div className="ao-input full">
                          <input type="text" placeholder="e.g. Harpreet Singh"
                            value={ov.driverName !== undefined ? ov.driverName : (o.driverName||'')}
                            onChange={e => setOverride(o._id,'driverName',e.target.value)} />
                        </div>
                      </div>
                      <div className="ao-row">
                        <div className="ao-label">Driver Mobile * <small>(10-digit, starts 6–9)</small>{o.driverPhone&&<small>Current: {o.driverPhone}</small>}</div>
                        <div className="ao-input full">
                          <input type="tel" placeholder="10-digit mobile number"
                            maxLength={10}
                            value={ov.driverPhone !== undefined ? ov.driverPhone : (o.driverPhone||'')}
                            onChange={e => {
                              const v = e.target.value.replace(/\D/g,'');
                              if (v.length === 1 && /^[0-5]/.test(v)) return; // block 0-5 as first digit
                              setOverride(o._id,'driverPhone', v.slice(0,10));
                            }} />
                        </div>
                      </div>
                      <div className="ao-row">
                        <div className="ao-label">Vehicle Number *{o.vehicleNumber&&<small>Current: {o.vehicleNumber}</small>}</div>
                        <div className="ao-input full">
                          <input type="text" placeholder="e.g. PB 03 AB 1234"
                            value={ov.vehicleNumber !== undefined ? ov.vehicleNumber : (o.vehicleNumber||'')}
                            onChange={e => setOverride(o._id,'vehicleNumber', e.target.value.toUpperCase())} />
                        </div>
                      </div>
                      <div style={{fontSize:12,color:'#888',padding:'4px 0'}}>
                        📧 Setting status to "Out for Delivery" will email driver name, number & vehicle to {o.email||'customer'} automatically.
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="oc-actions">
                    <div className="oc-actions-left">
                      <label>Status:</label>
                      <select
                        value={ov.status || o.status}
                        onChange={e => setOverride(o._id,'status',e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="confirmed">✅ Confirmed</option>
                        <option value="out_for_delivery">🚚 Out for Delivery</option>
                        <option value="delivered">📦 Delivered</option>
                      </select>
                      <span className="pay-badge">{o.paymentMethod}</span>
                    </div>
                    <button
                      className="btn-primary save-order-btn"
                      onClick={() => saveOrder(o)}
                      disabled={ov.saving}
                    >
                      {ov.saving ? 'Saving...' : '💾 Save Changes'}
                    </button>
                  </div>

                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{padding:40,textAlign:'center',color:'var(--text-light)'}}>No orders found</div>}
      </div>
    </div>
  );
}

/* ── OFFERS ── */
function OffersTab({ offers, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editOffer, setEditOffer] = useState(null);
  const emptyForm = { title:'', description:'', couponCode:'', privateCouponCode:'', isPrivate:false, type:'percent', discountPercent:10, discountAmount:0, active:true, validUntil:'', applicableOn:'all' };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd  = () => { setForm(emptyForm); setEditOffer(null); setShowForm(true); };
  const openEdit = (o) => { setForm({...o, validUntil:o.validUntil?new Date(o.validUntil).toISOString().split('T')[0]:''}); setEditOffer(o._id); setShowForm(true); };
  const handleSave = async () => {
    setSaving(true);
    try {
      if (editOffer) await updateOffer(editOffer, form);
      else await createOffer(form);
      setShowForm(false); onRefresh();
    } catch { alert('Error saving offer'); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; await deleteOffer(id); onRefresh(); };
  const toggleActive = async (o) => { await updateOffer(o._id, {...o, active:!o.active}); onRefresh(); };

  return (
    <div className="tab-content">
      <div className="tab-actions"><div /><button className="btn-primary" onClick={openAdd}>+ Add Offer</button></div>
      <div className="offers-admin-grid">
        {offers.map(o => (
          <div className={`offer-admin-card ${!o.active?'inactive':''}`} key={o._id}>
            <div className="oac-top">
              <div className="oac-discount">{o.type==='percent'?`${o.discountPercent}% OFF`:`₹${o.discountAmount} OFF`}</div>
              <div className="oac-actions">
                <button className={`toggle-btn ${o.active?'on':'off'}`} onClick={() => toggleActive(o)}>{o.active?'● Live':'○ Off'}</button>
                <button className="tbl-btn edit" onClick={() => openEdit(o)}>✏️</button>
                <button className="tbl-btn del"  onClick={() => handleDelete(o._id)}>🗑️</button>
              </div>
            </div>
            <h4>{o.title}</h4>
            {o.couponCode && (
              <div style={{margin:'6px 0 4px',display:'inline-block',background:'#FFF8E1',border:'1.5px dashed #F57F17',borderRadius:6,padding:'4px 12px',fontFamily:'monospace',fontWeight:700,fontSize:14,color:'#E65100',letterSpacing:'2px'}}>
                🌐 {o.couponCode} <span style={{fontSize:10,fontWeight:400}}>Public</span>
              </div>
            )}
            {o.privateCouponCode && (
              <div style={{margin:'4px 0',display:'inline-block',background:'#FFF3E0',border:'1.5px dashed #E65100',borderRadius:6,padding:'4px 12px',fontFamily:'monospace',fontWeight:700,fontSize:14,color:'#BF360C',letterSpacing:'2px'}}>
                🔒 {o.privateCouponCode} <span style={{fontSize:10,fontWeight:400}}>Private</span>
              </div>
            )}
            <p>{o.description}</p>
            {o.validUntil && <div className="oac-expiry">⏳ {new Date(o.validUntil).toLocaleDateString('en-IN')}</div>}
          </div>
        ))}
        {offers.length === 0 && <div className="no-data">No offers yet.</div>}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{editOffer?'Edit Offer':'New Offer'}</h3><button onClick={() => setShowForm(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="fg full"><label>Offer Title</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Monsoon Sale — 10% Off!" /></div>
                <div className="fg full"><label>Description</label><textarea rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>

                <div className="fg full" style={{background:form.isPrivate?'#FFF3E0':'#E8F5E9',borderRadius:10,padding:'14px 16px',border:`2px solid ${form.isPrivate?'#F57F17':'#4CAF50'}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:10}}>
                    <div>
                      <strong style={{fontSize:14,color:form.isPrivate?'#E65100':'#2E7D32'}}>
                        {form.isPrivate ? '🔒 Private Offer' : '🌐 Public Offer'}
                      </strong>
                      <p style={{margin:'3px 0 0',fontSize:12,color:'#666'}}>
                        {form.isPrivate
                          ? 'This offer is hidden from all public pages. Only works if customer has the code.'
                          : 'This offer appears on the Special Offers page and home page.'}
                      </p>
                    </div>
                    <label style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8,cursor:'pointer',whiteSpace:'nowrap'}}>
                      <input type="checkbox" checked={form.isPrivate}
                        onChange={e=>setForm(f=>({...f,isPrivate:e.target.checked}))} />
                      Make Private
                    </label>
                  </div>

                  {!form.isPrivate ? (
                    <div>
                      <label style={{fontSize:12,fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'0.6px'}}>
                        Public Coupon Code <span style={{fontWeight:400,textTransform:'none'}}>(shown to all customers)</span>
                      </label>
                      <input
                        value={form.couponCode || ''}
                        onChange={e=>setForm(f=>({...f,couponCode:e.target.value.toUpperCase().replace(/\s/g,'')}))}
                        placeholder="e.g. MONSOON10, DIWALI15"
                        style={{width:'100%',padding:'9px 12px',marginTop:6,border:'1.5px solid #ccc',borderRadius:8,fontFamily:'monospace',fontWeight:700,fontSize:15,letterSpacing:'2px',boxSizing:'border-box'}}
                      />
                      <small style={{fontSize:11,color:'#666'}}>Any customer can use this. Shown on offers page and cart.</small>
                    </div>
                  ) : (
                    <div>
                      <label style={{fontSize:12,fontWeight:700,color:'#E65100',textTransform:'uppercase',letterSpacing:'0.6px'}}>
                        Private Coupon Code <span style={{fontWeight:400,textTransform:'none'}}>(you share manually with specific customers)</span>
                      </label>
                      <input
                        value={form.privateCouponCode || ''}
                        onChange={e=>setForm(f=>({...f,privateCouponCode:e.target.value.toUpperCase().replace(/\s/g,'')}))}
                        placeholder="e.g. VIP20, FRIEND15, SPECIAL500"
                        style={{width:'100%',padding:'9px 12px',marginTop:6,border:'2px solid #F57F17',borderRadius:8,fontFamily:'monospace',fontWeight:700,fontSize:15,letterSpacing:'2px',background:'#FFFDE7',boxSizing:'border-box'}}
                      />
                      <small style={{fontSize:11,color:'#E65100'}}>⚠ This code is NEVER shown publicly. Share it yourself via WhatsApp/call/SMS.</small>
                    </div>
                  )}
                </div>

                <div className="fg"><label>Discount Type</label>
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                    <option value="percent">Percentage (%)</option><option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                {form.type==='percent'
                  ? <div className="fg"><label>Discount %</label><input type="number" value={form.discountPercent} onChange={e=>setForm(f=>({...f,discountPercent:e.target.value}))} /></div>
                  : <div className="fg"><label>Discount (₹)</label><input type="number" value={form.discountAmount} onChange={e=>setForm(f=>({...f,discountAmount:e.target.value}))} /></div>
                }
                <div className="fg"><label>Valid Until</label><input type="date" value={form.validUntil} onChange={e=>setForm(f=>({...f,validUntil:e.target.value}))} /></div>
                <div className="fg checkbox-row"><label><input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))} /> Active / Live</label></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving...':'Save Offer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── SETTINGS ── */
function SettingsTab({ settings, onRefresh }) {
  const [editingKey, setEditingKey] = useState(null);
  const [editVal, setEditVal]       = useState('');
  const [saving, setSaving]         = useState(false);
  const [savedKey, setSavedKey]     = useState(null);

  const startEdit = (s) => { setEditingKey(s.key); setEditVal(String(s.value)); };
  const cancelEdit = ()  => { setEditingKey(null); setEditVal(''); };

  // Email fields use text input; others use number
  const EMAIL_KEYS = ['email_from','email_pass','email_from_name','shop_phone','shop_address'];
  const isTextKey  = (key) => EMAIL_KEYS.includes(key);

  const saveSetting = async (key) => {
    setSaving(true);
    try {
      // Text fields stay as string; numeric fields parse as float
      const val = isTextKey(key) ? editVal : (isNaN(parseFloat(editVal)) ? editVal : parseFloat(editVal));
      await updateSetting(key, val);
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2500);
      setEditingKey(null);
      onRefresh();
    } catch { alert('Error saving setting'); }
    finally { setSaving(false); }
  };

  const [testingEmail, setTestingEmail]   = useState(false);
  const [testEmailMsg, setTestEmailMsg]   = useState('');
  const [testEmailErr, setTestEmailErr]   = useState('');

  const handleTestEmail = async () => {
    setTestingEmail(true); setTestEmailMsg(''); setTestEmailErr('');
    try {
      const res = await testEmail();
      setTestEmailMsg(res.data.message);
    } catch (err) {
      setTestEmailErr(err.response?.data?.error || 'Test failed. Check email and password.');
    } finally { setTestingEmail(false); }
  };

  const CHARGE_KEYS   = ['labour_rate_per_sqft','transport_base_charge','transport_light_per_km','transport_heavy_per_km','transport_heavy_sqft_threshold','tile_weight_per_sqft_kg'];
  const LOCATION_KEYS = ['shop_lat','shop_lng'];
  const EMAIL_SETTING_KEYS = ['email_from','email_pass','email_from_name','shop_phone','shop_address'];

  const emailFromValue = settings.find(s => s.key === 'email_from')?.value || '';
  const emailPassValue = settings.find(s => s.key === 'email_pass')?.value || '';
  const emailConfigured = Boolean(emailFromValue && emailPassValue);

  const grouped = {
    '⚙️ Labour & Transport Rates':        settings.filter(s => CHARGE_KEYS.includes(s.key)),
    '📍 Shop Location':                    settings.filter(s => LOCATION_KEYS.includes(s.key)),
    '📧 Email Settings':                   settings.filter(s => EMAIL_SETTING_KEYS.includes(s.key)),
  };

  const SettingRow = ({ s }) => (
    <div className="setting-row" key={s.key}>
      <div className="sr-info">
        <div className="sr-label">{s.label}</div>
        <div className="sr-desc">{s.description}</div>
      </div>
      <div className="sr-value">
        {editingKey === s.key ? (
          <div className="sr-edit-row">
            <input
              type={s.key === 'email_pass' ? 'password' : isTextKey(s.key) ? 'text' : 'number'}
              step="any"
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveSetting(s.key)}
              autoFocus
              style={isTextKey(s.key) ? { width: 220 } : {}}
              placeholder={s.key === 'email_pass' ? '16-char App Password' : ''}
            />
            <button className="sr-save-btn" onClick={() => saveSetting(s.key)} disabled={saving}>
              {saving ? '...' : 'Save'}
            </button>
            <button className="sr-cancel-btn" onClick={cancelEdit}>✕</button>
          </div>
        ) : (
          <div className="sr-display">
            <span className={`sr-current ${savedKey === s.key ? 'saved-flash' : ''}`} style={{fontSize: isTextKey(s.key) ? 13 : undefined}}>
              {s.key === 'email_pass'
                ? (s.value ? '••••••••••••••••' : <em style={{color:'#e53935',fontSize:12}}>Not set</em>)
                : s.value || <em style={{color:'#e53935',fontSize:12}}>Not set</em>}
            </span>
            {savedKey === s.key && <span className="sr-saved-badge">Saved</span>}
            <button className="sr-edit-btn" onClick={() => startEdit(s)}>✏️ Edit</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="tab-content">
      <div className="settings-info-box">
        <strong>⚙️ App Settings</strong> — Change charge rates, shop location, and email configuration. All changes take effect immediately.
      </div>

      {Object.entries(grouped).map(([groupName, items]) => (
        items.length > 0 && (
          <div className="settings-group" key={groupName}>
            <h3 className="settings-group-title">{groupName}</h3>
            <div className="settings-list">
              {items.map(s => <SettingRow key={s.key} s={s} />)}
            </div>

            {/* Email test button — shown inside the email section */}
            {groupName === '📧 Email Settings' && (
              <>
                <div style={{marginTop:16, marginBottom:12, color:'#424242', fontSize:13, lineHeight:1.6}}>
                  Saved email credentials are kept hidden and will only change when you click <strong>Edit</strong> and save a new value. The password is displayed as a masked value for security.
                </div>
                {!emailConfigured && (
                  <div style={{marginTop:10, color:'#b71c1c', fontSize:13, lineHeight:1.5}}>
                    Email is not fully configured yet. Set a sender Gmail address and App Password to send order emails and run a test.
                  </div>
                )}
                <div style={{marginTop:8}}>
                  <button
                    className="btn-primary"
                    onClick={handleTestEmail}
                    disabled={testingEmail || !emailConfigured}
                    style={{fontSize:13,padding:'9px 20px'}}
                  >
                    {testingEmail ? '⏳ Sending test...' : '📧 Send Test Email'}
                  </button>
                  <span style={{fontSize:12,color:'var(--text-light)',marginLeft:10}}>
                    Sends a test email to your configured address to verify it works.
                  </span>
                  {testEmailMsg && <div style={{marginTop:8,background:'#E8F5E9',color:'#2E7D32',borderRadius:7,padding:'8px 12px',fontSize:13}}>{testEmailMsg}</div>}
                  {testEmailErr && <div style={{marginTop:8,background:'#FFEBEE',color:'#C62828',borderRadius:7,padding:'8px 12px',fontSize:13}}>{testEmailErr}</div>}
                </div>
              </>
            )}
          </div>
        )
      ))}

      <div className="settings-note">
        <strong>📧 How to get Gmail App Password:</strong><br/>
        1. Go to <strong>myaccount.google.com</strong><br/>
        2. Security → 2-Step Verification (must be ON)<br/>
        3. Security → App Passwords → Generate for "Mail"<br/>
        4. Copy the 16-character password and paste it in <strong>Gmail App Password</strong> above<br/><br/>
        <strong>📍 Shop Location:</strong> Coordinates are used to calculate delivery distance. Default is Bhucho Mandi, Bathinda.
      </div>
    </div>
  );
}
