import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, items } = useCart();
  const [sqftInput, setSqftInput] = useState('10');
  const [added, setAdded] = useState(false);
  const sqft = parseInt(sqftInput) || 0;
  const canAdd = sqft >= 1;
  const inCart = items.some(i => i._id === product._id);

  const handleSqftChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^[0-9]+$/.test(val)) setSqftInput(val);
  };
  const handleSqftBlur = () => {
    if (!sqftInput || parseInt(sqftInput) < 1) setSqftInput('1');
  };
  const handleSqftKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
  };

  const handleAdd = () => {
    if (!canAdd) return;
    addToCart(product, sqft);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const total = canAdd ? (product.pricePerSqFt * sqft).toLocaleString('en-IN') : '—';

  return (
    <div className="product-card fade-in">
      <div className="card-image-wrap">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400'}
          alt={product.name}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'; }}
        />
        <div className="card-badges">
          <span className={`badge badge-${product.category}`}>{product.category === 'floor' ? '🏠 Floor' : '🧱 Wall'}</span>
          <span className={`badge badge-${product.finish}`}>{product.finish === 'glossy' ? '✨ Glossy' : '🪨 Matte'}</span>
        </div>
        {product.featured && <div className="featured-tag">Featured</div>}
      </div>
      <div className="card-body">
        <div className="card-company">{product.company}</div>
        <h3 className="card-name">{product.name}</h3>
        <div className="card-dim">📐 {product.dimensions}</div>
        <p className="card-desc">{product.description}</p>

        <div className="card-price-row">
          <div>
            <div className="card-price">₹{product.pricePerSqFt}<span>/sq.ft</span></div>
          </div>
          <div className="sqft-control">
            <button onClick={() => setSqftInput(s => String(Math.max(1, (parseInt(s)||1) - 5)))}>−</button>
            <input
              type="number"
              value={sqftInput}
              min="1"
              onChange={handleSqftChange}
              onBlur={handleSqftBlur}
              onKeyDown={handleSqftKeyDown}
              placeholder="qty"
            />
            <button onClick={() => setSqftInput(s => String((parseInt(s)||0) + 5))}>+</button>
          </div>
        </div>

        <div className="card-total">
          {canAdd
            ? <>Total: <strong>₹{total}</strong> for {sqft} sq.ft</>
            : <span style={{color:'#e53935'}}>Enter quantity above</span>}
        </div>

        <div className="card-btn-row">
          <button
            className={`card-add-btn ${inCart || added ? 'added' : ''} ${!canAdd ? 'disabled' : ''}`}
            onClick={handleAdd}
            disabled={!canAdd}
          >
            {added ? '✓ Added' : inCart ? '+ More' : 'Add to Cart'}
          </button>
          <Link to={`/product/${product._id}`} className="card-detail-btn">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
