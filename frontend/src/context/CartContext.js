import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Load initial state from localStorage
const loadCart = () => {
  try {
    const saved = localStorage.getItem('tilehouse_cart');
    return saved ? { items: JSON.parse(saved) } : { items: [] };
  } catch { return { items: [] }; }
};

// Load delivery info from localStorage
const loadDelivery = () => {
  try {
    const saved = localStorage.getItem('tilehouse_delivery');
    return saved ? JSON.parse(saved) : { selState: '', selDistrict: '', distanceKm: null, distanceNote: '' };
  } catch { return { selState: '', selDistrict: '', distanceKm: null, distanceNote: '' }; }
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i._id === action.payload._id);
      if (existing) {
        return { ...state, items: state.items.map(i => i._id === action.payload._id ? { ...i, squareFeet: i.squareFeet + (action.payload.squareFeet || 10) } : i) };
      }
      return { ...state, items: [...state.items, { ...action.payload, squareFeet: action.payload.squareFeet || 10 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i._id !== action.payload) };
    case 'UPDATE_SQFT':
      return { ...state, items: state.items.map(i => i._id === action.payload.id ? { ...i, squareFeet: Math.max(1, action.payload.sqft) } : i) };
    case 'CLEAR_CART':
      try { localStorage.removeItem('tilehouse_delivery'); } catch {}
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, null, loadCart);

  // Persist cart to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem('tilehouse_cart', JSON.stringify(state.items)); } catch {}
    // If cart becomes empty, clear saved delivery info too
    if (state.items.length === 0) {
      try { localStorage.removeItem('tilehouse_delivery'); } catch {}
    }
  }, [state.items]);

  const addToCart    = (product, sqft = 10) => dispatch({ type: 'ADD_ITEM', payload: { ...product, squareFeet: sqft } });
  const removeFromCart = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateSqft   = (id, sqft) => dispatch({ type: 'UPDATE_SQFT', payload: { id, sqft } });
  const clearCart    = () => dispatch({ type: 'CLEAR_CART' });

  const subtotal  = state.items.reduce((sum, item) => sum + item.pricePerSqFt * item.squareFeet, 0);
  const itemCount = state.items.length;

  return (
    <CartContext.Provider value={{ items: state.items, addToCart, removeFromCart, updateSqft, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart  = () => useContext(CartContext);
export { loadDelivery };
