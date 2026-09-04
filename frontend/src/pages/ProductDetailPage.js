import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProduct, getProducts } from '../utils/api';
import { useCart } from '../context/CartContext';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();

  const [product, setProduct]   = useState(null);
  const [variants, setVariants] = useState([]);
  const [similar, setSimilar]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const [sqftInput, setSqftInput] = useState('10');
  const sqft = parseInt(sqftInput) || 0;

  useEffect(() => {
    setLoading(true);
    setImgLoaded(false);
    window.scrollTo(0, 0);
    setSqftInput('10');

    getProduct(id).then(async res => {
      const p = res.data;
      setProduct(p);
      setSqftInput('10');

      // Variants = same company + same dimensions, different finish or category
      const varRes = await getProducts({ company: p.company, dimensions: p.dimensions });
      setVariants(varRes.data.filter(v => v._id !== p._id));

      // Similar = same dimensions, any company (excluding current)
      const simRes = await getProducts({ dimensions: p.dimensions });
      setSimilar(simRes.data.filter(s => s._id !== p._id && s.company !== p.company).slice(0, 4));

      setLoading(false);
    }).catch(() => { setLoading(false); navigate('/products'); });
  }, [id, navigate]);

  const inCart = items.some(i => i._id === product?._id);

  if (loading) return (
    <div style={{ paddingTop: 120, textAlign: 'center' }}>
      <div className="spinner" />
    </div>
  );

  if (!product) return null;

  const total = sqft > 0 ? (product.pricePerSqFt * sqft).toLocaleString('en-IN') : '—';

  const handleAdd = () => {
    if (sqft < 1) return;
    addToCart(product, sqft);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const SIZEGROUP_LABEL = {
    small:   '🚿 Small — Walls & Bathrooms',
    medium:  '🏠 Medium — Standard Floor',
    large:   '🏢 Large Format',
    plank:   '🪵 Plank / Wood Look',
    outdoor: '☀️ Outdoor',
  };

  return (
    <div className="detail-page">
      {/* Breadcrumb */}
      <div className="detail-breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/products">Products</Link>
          <span>›</span>
          <Link to={`/products?company=${product.company}`}>{product.company}</Link>
          <span>›</span>
          <span>{product.name}</span>
        </div>
      </div>

      <div className="detail-mobile-summary">
        <span>{product.category === 'floor' ? 'Floor Tile' : 'Wall Tile'}</span>
        <span>{product.finish === 'glossy' ? 'Glossy' : 'Matte'}</span>
      </div>

      <div className="container">
        {/* Main Detail */}
        <div className="detail-grid">

          {/* Left — Image */}
          <div className="detail-image-col">
            <div className="detail-image-wrap">
              {!imgLoaded && <div className="img-skeleton" />}
              <img
                src={product.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'}
                alt={product.name}
                className={imgLoaded ? 'loaded' : ''}
                onLoad={() => setImgLoaded(true)}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'; setImgLoaded(true); }}
              />
              <div className="detail-badges">
                <span className={`badge badge-${product.category}`}>
                  {product.category === 'floor' ? '🏠 Floor Tile' : '🧱 Wall Tile'}
                </span>
                <span className={`badge badge-${product.finish}`}>
                  {product.finish === 'glossy' ? '✨ Glossy' : '🪨 Matte'}
                </span>
                {product.featured && <span className="badge-featured">⭐ Featured</span>}
              </div>
            </div>

            {/* Variants same size */}
            {variants.length > 0 && (
              <div className="variants-box">
                <h4>Other finishes — same size</h4>
                <div className="variants-list">
                  {variants.map(v => (
                    <Link to={`/product/${v._id}`} className="variant-chip" key={v._id}>
                      <img
                        src={v.image}
                        alt={v.name}
                        onError={e => { e.target.style.display='none'; }}
                      />
                      <div>
                        <div className="vc-name">{v.name}</div>
                        <div className="vc-meta">{v.finish} · ₹{v.pricePerSqFt}/sqft</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Info */}
          <div className="detail-info-col">
            <div className="detail-company">{product.company}</div>
            <h1 className="detail-name">{product.name}</h1>

            <div className="detail-meta-row">
              <div className="detail-meta-item">
                <span className="dmi-label">Size</span>
                <span className="dmi-val">📐 {product.dimensions}</span>
              </div>
              <div className="detail-meta-item">
                <span className="dmi-label">Category</span>
                <span className="dmi-val">{SIZEGROUP_LABEL[product.sizeGroup]}</span>
              </div>
              <div className="detail-meta-item">
                <span className="dmi-label">Area</span>
                <span className="dmi-val">{product.category === 'floor' ? '🏠 Floor' : '🧱 Wall'}</span>
              </div>
              <div className="detail-meta-item">
                <span className="dmi-label">Finish</span>
                <span className="dmi-val">{product.finish === 'glossy' ? '✨ Glossy' : '🪨 Matte'}</span>
              </div>
              <div className="detail-meta-item">
                <span className="dmi-label">Stock</span>
                <span className={`dmi-val ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                  {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                </span>
              </div>
            </div>

            <div className="detail-description">
              <p>{product.description}</p>
            </div>

            {/* Price + Calculator */}
            <div className="detail-price-box">
              <div className="dpb-rate">
                ₹{product.pricePerSqFt}
                <span>/sq.ft</span>
              </div>

              <div className="dpb-calc">
                <label>Enter Square Feet Required</label>
                <div className="dpb-sqft-row">
                  <div className="sqft-stepper">
                    <button onClick={() => setSqftInput(s => String(Math.max(1, (parseInt(s)||1) - 5)))}>−</button>
                    <input
                      type="number" min="1" value={sqftInput}
                      onChange={e => {
                        const v = e.target.value;
                        if (v === '' || /^[0-9]+$/.test(v)) setSqftInput(v);
                      }}
                      onBlur={() => { if (!sqftInput || parseInt(sqftInput) < 1) setSqftInput('1'); }}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
                    />
                    <button onClick={() => setSqftInput(s => String((parseInt(s)||0) + 5))}>+</button>
                  </div>
                  <span className="sqft-label">sq.ft</span>
                </div>
                <div className="dpb-total">
                  {sqft > 0
                    ? <>Total for {sqft} sq.ft = <strong>₹{total}</strong></>
                    : <span style={{color:'#e53935',fontSize:13}}>Enter quantity to see total</span>}
                </div>
              </div>

              <div className="dpb-actions">
                <button
                  className={`add-cart-btn ${added ? 'added' : ''}`}
                  onClick={handleAdd}
                  disabled={!product.inStock}
                >
                  {added ? '✓ Added to Cart!' : inCart ? '+ Add More to Cart' : '🛒 Add to Cart'}
                </button>
                <Link to="/cart" className="view-cart-btn">View Cart →</Link>
              </div>
            </div>

            {/* Info Note */}
            <div className="detail-note">
              <div>📞 Need help with quantity calculation? Call us at <strong>+91 9872635534</strong></div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <section className="similar-section">
            <h2>Same Size — Other Brands</h2>
            <p>Compare {product.dimensions} tiles from other brands</p>
            <div className="similar-grid">
              {similar.map(s => (
                <Link to={`/product/${s._id}`} className="similar-card" key={s._id}>
                  <div className="sc-img">
                    <img
                      src={s.image}
                      alt={s.name}
                      onError={e => { e.target.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300'; }}
                    />
                  </div>
                  <div className="sc-body">
                    <div className="sc-company">{s.company}</div>
                    <div className="sc-name">{s.name}</div>
                    <div className="sc-dim">{s.dimensions}</div>
                    <div className="sc-price">₹{s.pricePerSqFt}<span>/sq.ft</span></div>
                    <div className="sc-badges">
                      <span className={`badge badge-${s.finish}`}>{s.finish}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back Button */}
        <div style={{ margin: '20px 0 60px' }}>
          <button className="back-btn" onClick={() => navigate(-1)}>← Back to Products</button>
        </div>
      </div>
    </div>
  );
}
