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

export default function CheckoutScreen() {
  const navigate = useNavigate();
  const { session } = useCustomerSession();
  const { cart, loading: cartLoading } = useCart();
  const [step, setStep] = useState('details'); // details | payment | processing
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    specialInstructions: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [razorpayOrder, setRazorpayOrder] = useState(null);

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

  const handleNext = async () => {
    if (!validateDetails()) return;
    setError(null);
    if (paymentMethod === 'cash') {
      await placeOrder('cash');
    } else {
      setStep('payment');
    }
  };

  const handleBack = () => {
    setStep('details');
    setError(null);
  };

  const placeOrder = async (method) => {
    setLoading(true);
    setError(null);
    try {
      const orderData = {
        orderType: 'dine-in',
        paymentMethod: method,
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        specialInstructions: formData.specialInstructions.trim(),
      };
      const data = await customerApi.checkout(orderData);
      setOrder(data.order);
      if (method === 'online') {
        await createRazorpayOrder(data.order._id, data.totalAmount);
      } else {
        navigate(`/tracking/${data.order._id}`, { replace: true });
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
        amount: Math.round(amount * 100), // amount in paise
        currency: 'INR',
      });
      setRazorpayOrder(data.razorpayOrder);
      setStep('processing');
      loadRazorpayScript().then(() => openRazorpayCheckout(data));
    } catch (e) {
      setError(e.message);
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
      key: data.razorpayOrder.key_id || 'rzp_test_key', // This should come from backend
      amount: data.razorpayOrder.amount,
      currency: data.razorpayOrder.currency,
      name: session?.restaurant?.name || 'OrderXpress',
      description: `Order #${order?.orderNumber || order?._id?.slice(-6)}`,
      order_id: data.razorpayOrder.id,
      handler: handlePaymentSuccess,
      prefill: {
        name: formData.customerName,
        contact: formData.phone,
      },
      theme: {
        color: '#0b3877',
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          setStep('details');
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
      navigate(`/tracking/${order._id}`, { replace: true });
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
      <div className="checkout-progress">
        <div className={`progress-step ${step !== 'details' ? 'completed' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Details</span>
        </div>
        <div className="progress-line" />
        <div className={`progress-step ${step === 'payment' || step === 'processing' ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Payment</span>
        </div>
        <div className="progress-line" />
        <div className={`progress-step ${step === 'processing' ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Confirm</span>
        </div>
      </div>

      {step === 'details' && (
        <CheckoutDetailsForm
          formData={formData}
          onChange={handleInputChange}
          onNext={handleNext}
          loading={loading}
          error={error}
        />
      )}

      {step === 'payment' && (
        <PaymentMethodScreen
          paymentMethod={paymentMethod}
          onMethodChange={setPaymentMethod}
          onBack={handleBack}
          onNext={handleNext}
          loading={loading}
          orderTotal={cart.totalAmount}
        />
      )}

      {step === 'processing' && (
        <ProcessingScreen order={order} razorpayOrder={razorpayOrder} loading={loading} />
      )}
    </div>
  );
}

function CheckoutDetailsForm({ formData, onChange, onNext, loading, error }) {
  return (
    <Card className="checkout-form">
      <h2>Customer Details</h2>
      {error && <div className="error-banner">{error}</div>}
      <div className="form-group">
        <label htmlFor="customerName">Full Name *</label>
        <Input
          id="customerName"
          value={formData.customerName}
          onChange={(e) => onChange('customerName', e.target.value)}
          placeholder="Enter your name"
          autoComplete="name"
        />
      </div>
      <div className="form-group">
        <label htmlFor="phone">Phone Number *</label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
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
          onChange={(e) => onChange('specialInstructions', e.target.value)}
          placeholder="e.g., Less spicy, no onions, extra napkins"
          autoComplete="off"
        />
      </div>
      <Button onClick={onNext} loading={loading} className="submit-btn" size="lg">
        Continue to Payment
      </Button>
    </Card>
  );
}

function PaymentMethodScreen({ paymentMethod, onMethodChange, onBack, onNext, loading, orderTotal }) {
  return (
    <Card className="checkout-form">
      <div className="screen-header">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <h2>Payment Method</h2>
      </div>
      <p className="order-total">Total: <strong>₹{orderTotal}</strong></p>
      <div className="payment-options">
        <label className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="online"
            checked={paymentMethod === 'online'}
            onChange={() => onMethodChange('online')}
          />
          <div className="option-content">
            <span className="option-icon">💳</span>
            <div>
              <strong>Online Payment</strong>
              <span>Pay via Razorpay (UPI, Cards, Net Banking)</span>
            </div>
          </div>
        </label>
        <label className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="cash"
            checked={paymentMethod === 'cash'}
            onChange={() => onMethodChange('cash')}
          />
          <div className="option-content">
            <span className="option-icon">💵</span>
            <div>
              <strong>Pay at Counter</strong>
              <span>Pay with cash when your order is ready</span>
            </div>
          </div>
        </label>
      </div>
      <Button onClick={onNext} loading={loading} className="submit-btn" size="lg">
        {paymentMethod === 'online' ? 'Pay Online' : 'Place Order'}
      </Button>
    </Card>
  );
}

function ProcessingScreen({ order, razorpayOrder, loading }) {
  return (
    <Card className="checkout-form processing">
      <div className="processing-icon">
        <div className="spinner" />
      </div>
      <h2>Processing Payment</h2>
      <p>Please complete the payment in the Razorpay window</p>
      {razorpayOrder && (
        <div className="order-ref">
          Order: <strong>#{order?.orderNumber || order?._id?.slice(-6)}</strong>
        </div>
      )}
      {loading && <Spinner size="large" />}
    </Card>
  );
}