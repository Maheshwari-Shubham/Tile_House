import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getProducts } from '../utils/api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

const COMPANIES  = ['All', 'Somany', 'Kajaria', 'Oasis', 'Local'];
const FINISHES   = ['All', 'matte', 'glossy'];
const CATEGORIES = ['All', 'floor', 'wall'];

// Canonical dimension order — each becomes its own collapsible section
const DIMENSION_SECTIONS = [
  // ── Small / Wall ──
  { dim: '10x10 cm',    label: '10×10 cm',      group: 'Small — Walls & Bathrooms', icon: '🚿' },
  { dim: '10x20 cm',    label: '10×20 cm',      group: 'Small — Walls & Bathrooms', icon: '🚿' },
  { dim: '20x30 cm',    label: '20×30 cm',      group: 'Small — Walls & Bathrooms', icon: '🚿' },
  { dim: '30x30 cm',    label: '30×30 cm',      group: 'Small — Walls & Bathrooms', icon: '🚿' },
  { dim: '30x45 cm',    label: '30×45 cm',      group: 'Small — Walls & Bathrooms', icon: '🚿' },
  { dim: '40x40 cm',    label: '40×40 cm',      group: 'Small — Walls & Bathrooms', icon: '🚿' },
  { dim: '30x60 cm',    label: '30×60 cm',      group: 'Small — Walls & Bathrooms', icon: '🚿' },
  { dim: '12x12 inches',label: '12×12 inches',  group: 'Small — Walls & Bathrooms', icon: '🚿' },
  // ── Medium / Standard ──
  { dim: '300x600 mm',  label: '300×600 mm',    group: 'Medium / Standard — Floors & General', icon: '🏠' },
  { dim: '400x400 mm',  label: '400×400 mm',    group: 'Medium / Standard — Floors & General', icon: '🏠' },
  { dim: '600x600 mm',  label: '600×600 mm',    group: 'Medium / Standard — Floors & General', icon: '🏠' },
  // ── Large Format ──
  { dim: '600x1200 mm', label: '600×1200 mm',   group: 'Large Format — Living & Commercial', icon: '🏢' },
  { dim: '800x1600 mm', label: '800×1600 mm',   group: 'Large Format — Living & Commercial', icon: '🏢' },
  { dim: '1000x1000 mm',label: '1000×1000 mm',  group: 'Large Format — Living & Commercial', icon: '🏢' },
  { dim: '1200x1800 mm',label: '1200×1800 mm',  group: 'Large Format — Living & Commercial', icon: '🏢' },
  { dim: '800x2400 mm', label: '800×2400 mm',   group: 'Large Format — Living & Commercial', icon: '🏢' },
  // ── Plank ──
  { dim: '15x90 cm',    label: '15×90 cm',      group: 'Plank Tiles — Wood Look',  icon: '🪵' },
  { dim: '145x600 mm',  label: '145×600 mm',    group: 'Plank Tiles — Wood Look',  icon: '🪵' },
  { dim: '195x1200 mm', label: '195×1200 mm',   group: 'Plank Tiles — Wood Look',  icon: '🪵' },
  { dim: '20x120 cm',   label: '20×120 cm',     group: 'Plank Tiles — Wood Look',  icon: '🪵' },
  { dim: '30x120 cm',   label: '30×120 cm',     group: 'Plank Tiles — Wood Look',  icon: '🪵' },
  // ── Outdoor ──
  // outdoor tiles share dim strings with other groups but have sizeGroup='outdoor'
];

const OUTDOOR_SECTION = {
  group: 'Outdoor — Heavy Duty & Thick Slabs', icon: '☀️',
};

// Unique group names in order
const GROUP_ORDER = [
  'Small — Walls & Bathrooms',
  'Medium / Standard — Floors & General',
  'Large Format — Living & Commercial',
  'Plank Tiles — Wood Look',
  'Outdoor — Heavy Duty & Thick Slabs',
];

export default function ProductsPage() {
  const location  = useLocation();
  const urlParams = new URLSearchParams(location.search);

  const [allProducts, setAllProducts]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeCompany, setActiveCompany] = useState(urlParams.get('company') || 'All');
  const [activeFinish,  setActiveFinish]  = useState(urlParams.get('finish')  || 'All');
  const [activeCategory,setActiveCategory]= useState(urlParams.get('category')|| 'All');
  const [activeDim, setActiveDim]         = useState('all');   // 'all' or exact dim string
  const [search, setSearch]               = useState('');
  const [collapsed, setCollapsed]         = useState({});      // group key → true=collapsed

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = {};
    if (activeCompany  !== 'All') params.company  = activeCompany;
    if (activeFinish   !== 'All') params.finish    = activeFinish;
    if (activeCategory !== 'All') params.category  = activeCategory;
    getProducts(params)
      .then(r => setAllProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCompany, activeFinish, activeCategory]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Client-side filter
  const filtered = allProducts.filter(p => {
    const matchDim    = activeDim === 'all' || p.dimensions === activeDim;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.dimensions.toLowerCase().includes(search.toLowerCase());
    return matchDim && matchSearch;
  });

  // Build grouped structure:
  // group label → array of { dim, label, icon, products[] }
  const buildGrouped = () => {
    const result = {};

    // Non-outdoor: match by exact dimensions
    DIMENSION_SECTIONS.forEach(ds => {
      const items = filtered.filter(p => p.dimensions === ds.dim && p.sizeGroup !== 'outdoor');
      if (items.length === 0) return;
      if (!result[ds.group]) result[ds.group] = [];
      // Check if this dim sub-section already exists
      let sub = result[ds.group].find(s => s.dim === ds.dim);
      if (!sub) {
        sub = { dim: ds.dim, label: ds.label, icon: ds.icon, items: [] };
        result[ds.group].push(sub);
      }
      sub.items.push(...items);
    });

    // Outdoor: all sizeGroup=outdoor
    const outdoorItems = filtered.filter(p => p.sizeGroup === 'outdoor');
    if (outdoorItems.length > 0) {
      // Sub-group by dimensions within outdoor
      const outdoorDims = [...new Set(outdoorItems.map(p => p.dimensions))];
      result[OUTDOOR_SECTION.group] = outdoorDims.map(dim => ({
        dim,
        label: dim,
        icon: OUTDOOR_SECTION.icon,
        items: outdoorItems.filter(p => p.dimensions === dim),
      }));
    }

    return result;
  };

  const grouped = buildGrouped();

  const toggleGroup = (grpKey) => setCollapsed(c => ({ ...c, [grpKey]: !c[grpKey] }));

  const clearAll = () => {
    setActiveCompany('All'); setActiveFinish('All');
    setActiveCategory('All'); setActiveDim('all'); setSearch('');
  };

  const activeFilterCount = [
    activeCompany !== 'All', activeFinish !== 'All',
    activeCategory !== 'All', activeDim !== 'all', search !== '',
  ].filter(Boolean).length;

  const allDimensions = [...new Set(allProducts.map(p => p.dimensions))];

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="container">
          <h1>Our Complete Collection</h1>
          <p>Select a brand, then browse tiles grouped by exact size — from tiny bathroom mosaics to 2.4m commercial slabs</p>
        </div>
      </div>

      <div className="container">
        <div className="products-layout">

          {/* ── Sidebar ── */}
          <aside className="filters-sidebar">
            <div className="sidebar-head">
              <h3>Filters</h3>
              {activeFilterCount > 0 && (
                <button className="clear-all-btn" onClick={clearAll}>
                  Clear ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Search */}
            <div className="filter-search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text" placeholder="Search name or size..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="clear-search" onClick={() => setSearch('')}>✕</button>}
            </div>

            {/* Brand */}
            <div className="filter-group">
              <div className="filter-label">🏷️ Brand</div>
              <div className="company-btns">
                {COMPANIES.map(c => (
                  <button key={c}
                    className={`company-btn ${activeCompany === c ? 'active' : ''}`}
                    onClick={() => { setActiveCompany(c); setActiveDim('all'); }}
                  >
                    {c === 'Somany'  && <span className="co-dot" style={{background:'#8B5E3C'}} />}
                    {c === 'Kajaria' && <span className="co-dot" style={{background:'#1565C0'}} />}
                    {c === 'Oasis'   && <span className="co-dot" style={{background:'#2E7D32'}} />}
                    {c === 'Local'   && <span className="co-dot" style={{background:'#F57F17'}} />}
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Exact Dimension filter */}
            <div className="filter-group">
              <div className="filter-label">📐 Jump to Size</div>
              <div className="dim-btns">
                <button className={`dim-btn ${activeDim === 'all' ? 'active' : ''}`} onClick={() => setActiveDim('all')}>
                  All Sizes
                </button>
                {allDimensions.map(d => (
                  <button key={d}
                    className={`dim-btn ${activeDim === d ? 'active' : ''}`}
                    onClick={() => setActiveDim(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Finish */}
            <div className="filter-group">
              <div className="filter-label">✨ Finish</div>
              <div className="pill-btns">
                {FINISHES.map(f => (
                  <button key={f} className={`pill-btn ${activeFinish === f ? 'active' : ''}`} onClick={() => { setActiveFinish(f); setActiveDim('all'); }}>
                    {f === 'matte' ? '🪨 Matte' : f === 'glossy' ? '✨ Glossy' : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Area */}
            <div className="filter-group">
              <div className="filter-label">🏠 Area</div>
              <div className="pill-btns">
                {CATEGORIES.map(c => (
                  <button key={c} className={`pill-btn ${activeCategory === c ? 'active' : ''}`} onClick={() => { setActiveCategory(c); setActiveDim('all'); }}>
                    {c === 'floor' ? '⬛ Floor' : c === 'wall' ? '🟫 Wall' : 'All'}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Main ── */}
          <main className="products-main">

            {/* Active chips */}
            <div className="results-bar">
              <span className="result-count">
                {loading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
              </span>
              <div className="active-chips">
                {activeCompany  !== 'All'  && <span className="chip" onClick={() => setActiveCompany('All')}>{activeCompany} ×</span>}
                {activeFinish   !== 'All'  && <span className="chip" onClick={() => setActiveFinish('All')}>{activeFinish} ×</span>}
                {activeCategory !== 'All'  && <span className="chip" onClick={() => setActiveCategory('All')}>{activeCategory} ×</span>}
                {activeDim      !== 'all'  && <span className="chip" onClick={() => setActiveDim('all')}>{activeDim} ×</span>}
                {search && <span className="chip" onClick={() => setSearch('')}>"{search}" ×</span>}
              </div>
            </div>

            {loading ? (
              <div className="spinner" />
            ) : filtered.length === 0 ? (
              <div className="no-results">
                <div style={{fontSize:56}}>🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
                <button className="btn-primary" onClick={clearAll} style={{marginTop:16}}>Clear All</button>
              </div>
            ) : activeDim !== 'all' ? (
              // ── Single-dimension flat grid ──
              <div>
                <div className="dim-flat-header">
                  <h2>{activeDim}</h2>
                  <button className="back-to-all" onClick={() => setActiveDim('all')}>← All sizes</button>
                </div>
                <div className="products-grid">
                  {filtered.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </div>
            ) : (
              // ── Grouped by category, then exact dimension ──
              <div className="grouped-sections">
                {GROUP_ORDER.map(grpName => {
                  const subSections = grouped[grpName];
                  if (!subSections || subSections.length === 0) return null;
                  const isCollapsed = collapsed[grpName] === true;
                  const totalInGroup = subSections.reduce((s, ss) => s + ss.items.length, 0);

                  return (
                    <div className="group-block" key={grpName}>
                      {/* Group header */}
                      <div className="group-header" onClick={() => toggleGroup(grpName)}>
                        <div className="gh-left">
                          <span className="gh-icon">{subSections[0]?.icon}</span>
                          <h2 className="gh-title">{grpName}</h2>
                        </div>
                        <div className="gh-right">
                          <span className="gh-count">{totalInGroup} products</span>
                          <span className={`gh-chevron ${isCollapsed ? '' : 'open'}`}>›</span>
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div className="group-body">
                          {subSections.map(ss => (
                            <div className="dim-section" key={ss.dim}>
                              {/* Dimension sub-header */}
                              <div className="dim-section-header">
                                <div className="dsh-size">📐 {ss.label}</div>
                                <div className="dsh-count">{ss.items.length} product{ss.items.length !== 1 ? 's' : ''}</div>
                                <button
                                  className="dsh-filter-btn"
                                  onClick={() => setActiveDim(ss.dim)}
                                >
                                  View all →
                                </button>
                              </div>
                              <div className="products-grid">
                                {ss.items.map(p => <ProductCard key={p._id} product={p} />)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
