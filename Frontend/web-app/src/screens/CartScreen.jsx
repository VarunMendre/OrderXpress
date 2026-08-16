import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCustomerSession } from '../context/CustomerSessionContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import './CartScreen.css';

export default function CartScreen() {
  const navigate = useNavigate();
  const { session } = useCustomerSession();
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();

  useEffect(() => {
    if (!session) {
      navigate('/scan', { replace: true });
    }
  }, [session, navigate]);

  if (loading && !cart) {
    return (
      <div className="cart-screen loading">
        <Spinner size="large" />
      </div>
    );
  }

  if (!cart || cart.itemCount === 0) {
    return (
      <div className="cart-screen empty">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious items from the menu</p>
          <Button onClick={() => navigate('/menu')} className="continue-shopping">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-screen">
      <header className="cart-header">
        <h1>Your Cart</h1>
        {cart.itemCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => clearCart()}>
            Clear Cart
          </Button>
        )}
      </header>

      <div className="cart-items">
        {cart.items.map((item) => (
          <CartItemCard
            key={item.menuItemId}
            item={item}
            onUpdateQuantity={(qty) => updateQuantity(item.menuItemId, qty)}
            onRemove={() => removeItem(item.menuItemId)}
          />
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal ({cart.itemCount} items)</span>
          <span>₹{cart.subtotal || cart.totalAmount}</span>
        </div>
        {cart.tax && cart.tax > 0 && (
          <div className="summary-row">
            <span>Tax</span>
            <span>₹{cart.tax}</span>
          </div>
        )}
        {cart.serviceCharge && cart.serviceCharge > 0 && (
          <div className="summary-row">
            <span>Service Charge</span>
            <span>₹{cart.serviceCharge}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>Total</span>
          <span>₹{cart.totalAmount}</span>
        </div>

        <Button onClick={handleCheckout} className="checkout-btn" size="lg">
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}

function CartItemCard({ item, onUpdateQuantity, onRemove }) {
  return (
    <Card className="cart-item">
      <div className="cart-item-image">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} />
        ) : (
          <div className="image-placeholder">🍽️</div>
        )}
      </div>
      <div className="cart-item-details">
        <div className="cart-item-header">
          <h3>{item.name}</h3>
          <span className="cart-item-price">₹{item.price}</span>
        </div>
        {item.notes && (
          <p className="cart-item-notes">{item.notes}</p>
        )}
        <div className="cart-item-actions">
          <QuantityInput
            value={item.quantity}
            onChange={(e) => onUpdateQuantity(parseInt(e.target.value) || 0)}
            min={1}
            max={99}
          />
          <button className="remove-btn" onClick={onRemove} aria-label="Remove item">
            Remove
          </button>
        </div>
      </div>
    </Card>
  );
}

function QuantityInput({ value, onChange, min, max }) {
  return (
    <div className="quantity-input">
      <button
        type="button"
        className="qty-btn"
        onClick={() => onChange({ target: { value: Math.max(min, value - 1) } })}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className="qty-field"
        aria-label="Quantity"
      />
      <button
        type="button"
        className="qty-btn"
        onClick={() => onChange({ target: { value: Math.min(max, value + 1) } })}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}