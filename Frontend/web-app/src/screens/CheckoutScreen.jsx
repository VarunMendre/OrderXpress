import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCustomerSession } from '../context/CustomerSessionContext';
import { customerApi, paymentApi } from '../api/client';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import './CheckoutScreen.css';

const ORDER_TYPE_KEY = 'orderxpress.orderType';

export default function CheckoutScreen() {
  const navigate = useNavigate();
  const { session } = useCustomerSession();
  const { cart, loading: cartLoading } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    tableNumber: '',
    specialInstructions: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  const orderType = sessionStorage.getItem(ORDER_TYPE_KEY) || 'dine-in';

  useEffect(() => {
    if (!session || cartLoading) return;
    if (!cart || cart.itemCount === 0) {
      navigate('/cart', { replace: true });
    }
  }, [session, cart, cartLoading, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateDetails = () => {
    if (!formData.customerName.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const placeOrder = async (method) => {
    setLoading(true);
    setError(null);
    try {
      const orderData = {
        orderType,
        paymentMethod: method,
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        tableNumber: formData.tableNumber.trim(),
        specialInstructions: formData.specialInstructions.trim(),
      };
      const data = await customerApi.checkout(orderData);
      setOrder(data);
      sessionStorage.setItem('orderxpress.lastOrder', JSON.stringify(data));
      if (method === 'online') {
        await createRazorpayOrder(data._id, data.total);
      } else {
        navigate(`/tracking/${data._id}`, { replace: true });
      }
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const createRazorpayOrder = async (orderId, amount) => {
    try {
      const data = await paymentApi.createRazorpayOrder({
        orderId,
        amount: Math.round(amount * 100),
        currency: 'INR',
      });
      loadRazorpayScript().then(() => openRazorpayCheckout(data));
    } catch (e) {
      setError(`${e.message} — please pay at the counter instead.`);
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve();
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  const openRazorpayCheckout = (data) => {
    const options = {
      key: data.razorpayOrder?.keyId || 'rzp_test_key',
      amount: data.razorpayOrder.amount,
      currency: data.razorpayOrder.currency,
      name: 'OrderXpress',
      description: `Order #${order?.orderNumber || order?._id?.slice(-6)}`,
      order_id: data.razorpayOrder.id,
      handler: handlePaymentSuccess,
      prefill: {
        name: formData.customerName,
        contact: formData.phone,
      },
      theme: {
        color: '#2563eb',
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          navigate(`/tracking/${order?._id}`, { replace: true });
        },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePaymentSuccess = async (response) => {
    setLoading(true);
    try {
      await paymentApi.verifyRazorpayPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
      navigate(`/tracking/${order?._id}`, { replace: true });
    } catch (e) {
      setError('Payment verification failed. Please contact support.');
      setLoading(false);
    }
  };

  if (!session || !cart) {
    return (
      <div className="checkout-screen loading">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="checkout-screen">
      <header className="checkout-header">
        <Button variant="ghost" size="sm" onClick={() => navigate('/cart')}>
          ← Cart
        </Button>
        <h1>Checkout</h1>
      </header>

      <div className="checkout-tag">
        <span className="tag-icon">{orderType === 'takeaway' ? '🛍️' : '🍽️'}</span>
        {orderType === 'takeaway' ? 'Take Away' : 'Dine In'}
      </div>

      <Card className="checkout-form">
        {error && <div className="error-banner">{error}</div>}
        <div className="form-group">
          <label htmlFor="customerName">Name *</label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            placeholder="Enter your name"
            autoComplete="name"
          />
        </div>
        {orderType === 'dine-in' && (
          <div className="form-group">
            <label htmlFor="tableNumber">Table Number</label>
            <Input
              id="tableNumber"
              value={formData.tableNumber}
              onChange={(e) => handleInputChange('tableNumber', e.target.value)}
              placeholder="e.g., 12"
              autoComplete="off"
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            maxLength={10}
          />
        </div>
        <div className="form-group">
          <label htmlFor="specialInstructions">Special Instructions (optional)</label>
          <Input
            id="specialInstructions"
            value={formData.specialInstructions}
            onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
            placeholder="e.g., Less spicy, no onions"
            autoComplete="off"
          />
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          {cart.items.map((item) => (
            <div className="summary-line" key={item.menuItemId}>
              <span>{item.name} ×{item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="summary-line muted">
            <span>Subtotal</span>
            <span>₹{cart.subtotal}</span>
          </div>
          {cart.tax > 0 && (
            <div className="summary-line muted">
              <span>Tax</span>
              <span>₹{cart.tax}</span>
            </div>
          )}
          <div className="summary-line total">
            <span>Total</span>
            <span>₹{cart.total}</span>
          </div>
        </div>

        <div className="payment-options">
          <label className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={() => setPaymentMethod('cash')}
            />
            <div className="option-content">
              <span className="option-icon">💵</span>
              <div>
                <strong>Pay at Counter</strong>
                <span>Pay with cash when your order is ready</span>
              </div>
            </div>
          </label>
          <label className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={() => setPaymentMethod('online')}
            />
            <div className="option-content">
              <span className="option-icon">💳</span>
              <div>
                <strong>Online Payment</strong>
                <span>Pay via Razorpay (UPI, Cards, Net Banking)</span>
              </div>
            </div>
          </label>
        </div>

        <Button onClick={() => placeOrder(paymentMethod)} loading={loading} className="submit-btn" size="lg">
          Place Order · ₹{cart.total}
        </Button>
      </Card>
    </div>
  );
}