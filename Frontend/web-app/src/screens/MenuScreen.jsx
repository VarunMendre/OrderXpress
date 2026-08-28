import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerSession } from '../context/CustomerSessionContext';
import { useCart } from '../context/CartContext';
import { customerApi } from '../api/client';
import Spinner from '../components/Spinner';
import './MenuScreen.css';

const CATEGORY_META = {
  starters: { icon: '🍢', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  mains: { icon: '🍛', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  drinks: { icon: '🥤', color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
  desserts: { icon: '🍰', color: '#16A34A', bg: 'rgba(22,163,74,0.1)' },
  default: { icon: '🍽️', color: '#374151', bg: 'rgba(17,24,39,0.06)' },
};

function categoryMeta(key) {
  const k = String(key || '').toLowerCase();
  return CATEGORY_META[k] || CATEGORY_META.default;
}

export default function MenuScreen() {
  const navigate = useNavigate();
  const { session, status } = useCustomerSession();
  const { cart, addItem, updateQuantity, loading: cartLoading } = useCart();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status !== 'active') {
      navigate('/scan', { replace: true });
      return;
    }
    loadMenu();
  }, [status, navigate]);

  const loadMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerApi.getMenu();
      const list = data.items || [];
      setItems(list);
      const cats = [...new Set(list.map((i) => i.category).filter(Boolean))];
      setCategories(cats);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter((i) => i.category === activeCategory);

  const getCartQuantity = (itemId) => {
    if (!cart?.items) return 0;
    const cartItem = cart.items.find((i) => i.menuItemId === itemId);
    return cartItem?.quantity || 0;
  };

  const handleAdd = async (item) => {
    try {
      await addItem(item, 1);
    } catch {
      // error handled by context
    }
  };

  const handleStep = async (item, delta) => {
    try {
      const current = getCartQuantity(item._id);
      await updateQuantity(item._id, current + delta);
    } catch {
      // error handled by context
    }
  };

  const cartCount = cart?.itemCount || 0;
  const cartTotal = cart?.total || 0;
  const tableLabel = session?.tableId ? `Table ${session.tableId}` : '';

  if (loading) {
    return (
      <div className="menu-screen loading">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-screen error">
        <p>{error}</p>
        <button className="btn-retry" onClick={loadMenu}>Retry</button>
      </div>
    );
  }

  return (
    <div className="menu-screen">
      <header className="menu-header">
        <div className="restaurant-info">
          <h1>OrderXpress</h1>
          {tableLabel && <p>{tableLabel}</p>}
        </div>
        <button className="cart-btn" onClick={() => navigate('/cart')} aria-label="Cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && <span className="cart-badge show">{cartCount}</span>}
        </button>
      </header>

      <nav className="category-grid">
        <CategoryCard
          key="all"
          label="All"
          count={items.length}
          active={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
          meta={CATEGORY_META.default}
        />
        {categories.map((cat) => (
          <CategoryCard
            key={cat}
            label={cat}
            count={items.filter((i) => i.category === cat).length}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            meta={categoryMeta(cat)}
          />
        ))}
      </nav>

      <div className="menu-items">
        {filteredItems.length === 0 ? (
          <div className="empty-menu">
            <p>No items in this category</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <MenuItemRow
              key={item._id}
              item={item}
              quantity={getCartQuantity(item._id)}
              onAdd={() => handleAdd(item)}
              onStep={(delta) => handleStep(item, delta)}
            />
          ))
        )}
      </div>

      {cartCount > 0 && !cartLoading && (
        <div className="bottom-cta show">
          <button className="btn-checkout" onClick={() => navigate('/cart')}>
            View Cart · ₹{cartTotal}
          </button>
        </div>
      )}
    </div>
  );
}

function CategoryCard({ label, count, active, onClick, meta }) {
  return (
    <button className={`category-card ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="cat-icon" style={{ background: meta.bg, color: meta.color }}>{meta.icon}</span>
      <h4>{label}</h4>
      <p>{count} item{count !== 1 ? 's' : ''}</p>
    </button>
  );
}

function MenuItemRow({ item, quantity, onAdd, onStep }) {
  const isVeg = item.isVegetarian !== false;
  return (
    <div className="menu-item">
      <div className="item-img">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} loading="lazy" />
        ) : (
          <span className="item-img-fallback">{isVeg ? '🥗' : '🍗'}</span>
        )}
      </div>
      <div className="item-info">
        <div className="item-title-row">
          <h4>{item.name}</h4>
          {isVeg ? (
            <span className="veg-dot" title="Veg" />
          ) : (
            <span className="nonveg-dot" title="Non-Veg" />
          )}
        </div>
        {item.description && <div className="item-desc">{item.description}</div>}
        <div className="item-price">₹{item.price}</div>
      </div>
      {quantity === 0 ? (
        <button className="item-add" onClick={onAdd} aria-label={`Add ${item.name}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      ) : (
        <div className="item-qty show">
          <button onClick={() => onStep(-1)} aria-label="Decrease">−</button>
          <span>{quantity}</span>
          <button onClick={() => onStep(1)} aria-label="Increase">+</button>
        </div>
      )}
    </div>
  );
}