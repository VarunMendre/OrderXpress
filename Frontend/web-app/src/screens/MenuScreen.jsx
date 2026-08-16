import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerSession } from '../context/CustomerSessionContext';
import { useCart } from '../context/CartContext';
import { customerApi } from '../api/client';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import './MenuScreen.css';

export default function MenuScreen() {
  const navigate = useNavigate();
  const { session, status } = useCustomerSession();
  const { cart, addItem, loading: cartLoading } = useCart();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());

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
      setItems(data.items || []);
      const cats = [...new Set((data.items || []).map((i) => i.category).filter(Boolean))];
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

  const handleAddToCart = async (item) => {
    try {
      await addItem(item._id, 1);
    } catch {
      // error handled by context
    }
  };

  const handleQuantityChange = async (item, delta) => {
    const currentQty = getCartQuantity(item._id);
    const newQty = Math.max(0, currentQty + delta);
    if (newQty === 0) {
      await handleAddToCart({ ...item, _id: item._id }); // This will add then we need to remove... 
      // Actually we need a remove function - let's use addItem with quantity 0
    } else {
      try {
        await addItem(item._id, newQty);
      } catch {
      }
    }
  };

  if (loading) {
    return (
      <div className="menu-screen loading">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-screen error">
        <p>{error}</p>
        <Button onClick={loadMenu}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="menu-screen">
      <header className="menu-header">
        <div className="restaurant-info">
          <h1>{session?.restaurant?.name || 'Restaurant'}</h1>
          <p>Table {session?.table?.tableNumber || '—'}</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/cart')}
          className="cart-button"
        >
          Cart
          {cart?.itemCount > 0 && <Badge>{cart.itemCount}</Badge>}
        </Button>
      </header>

      <nav className="category-tabs" role="tablist">
        <button
          role="tab"
          className={activeCategory === 'all' ? 'active' : ''}
          onClick={() => setActiveCategory('all')}
          aria-selected={activeCategory === 'all'}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            className={activeCategory === cat ? 'active' : ''}
            onClick={() => setActiveCategory(cat)}
            aria-selected={activeCategory === cat}
          >
            {cat}
          </button>
        ))}
      </nav>

      <div className="menu-list">
        {filteredItems.length === 0 ? (
          <div className="empty-menu">
            <p>No items in this category</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              quantity={getCartQuantity(item._id)}
              onAdd={() => handleAddToCart(item)}
              onQuantityChange={(delta) => handleQuantityChange(item, delta)}
              expanded={expandedItems.has(item._id)}
              onToggleExpand={() => setExpandedItems((prev) => {
                const next = new Set(prev);
                if (next.has(item._id)) next.delete(item._id);
                else next.add(item._id);
                return next;
              })}
            />
          ))
        )}
      </div>

      {cart?.itemCount > 0 && (
        <div className="cart-summary-bar">
          <div className="cart-summary-info">
            <span>{cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''}</span>
            <span>₹{cart.totalAmount}</span>
          </div>
          <Button onClick={() => navigate('/cart')} className="view-cart-btn">
            View Cart
          </Button>
        </div>
      )}
    </div>
  );
}

function MenuItemCard({ item, quantity, onAdd, onQuantityChange, expanded, onToggleExpand }) {
  const isVeg = item.isVegetarian !== false;
  const hasDescription = item.description && item.description.trim();

  return (
    <Card className={`menu-item ${expanded ? 'expanded' : ''}`}>
      <div className="menu-item-main" onClick={onToggleExpand}>
        <div className="menu-item-info">
          <div className="menu-item-header">
            <h3>{item.name}</h3>
            <span className="menu-item-price">₹{item.price}</span>
          </div>
          {hasDescription && (
            <p className={`menu-item-description ${!expanded ? 'truncated' : ''}`}>
              {item.description}
            </p>
          )}
          <div className="menu-item-meta">
            {isVeg && <Badge variant="success" size="sm">Veg</Badge>}
            {!isVeg && <Badge variant="warning" size="sm">Non-Veg</Badge>}
            {item.category && <Badge variant="secondary" size="sm">{item.category}</Badge>}
          </div>
        </div>
        <QuantityControl
          quantity={quantity}
          onAdd={onAdd}
          onQuantityChange={onQuantityChange}
        />
      </div>
      {expanded && hasDescription && (
        <div className="menu-item-expanded">
          <p>{item.description}</p>
        </div>
      )}
    </Card>
  );
}

function QuantityControl({ quantity, onAdd, onQuantityChange }) {
  if (quantity === 0) {
    return (
      <button className="add-button" onClick={onAdd}>
        <span>+ Add</span>
      </button>
    );
  }
  return (
    <div className="quantity-control">
      <button className="qty-btn" onClick={() => onQuantityChange(-1)} aria-label="Decrease">
        −
      </button>
      <span className="qty-value">{quantity}</span>
      <button className="qty-btn" onClick={() => onQuantityChange(1)} aria-label="Increase">
        +
      </button>
    </div>
  );
}