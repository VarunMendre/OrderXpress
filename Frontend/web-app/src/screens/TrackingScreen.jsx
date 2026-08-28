import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerSession } from '../context/CustomerSessionContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import './TrackingScreen.css';

const STATUS_FLOW = ['pending_payment', 'accepted', 'paid', 'completed'];
const STATUS_LABELS = {
  draft: 'Draft',
  pending_payment: 'Order Placed',
  accepted: 'Order Accepted',
  paid: 'Payment Received',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
const STATUS_COLORS = {
  pending_payment: 'secondary',
  accepted: 'primary',
  paid: 'success',
  completed: 'success',
  cancelled: 'danger',
};

export default function TrackingScreen() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { session } = useCustomerSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session) {
      navigate('/scan', { replace: true });
      return;
    }
    try {
      const stored = sessionStorage.getItem('orderxpress.lastOrder');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!orderId || parsed._id === orderId || parsed.orderId === orderId) {
          setOrder(parsed);
          setError(null);
          setLoading(false);
          return;
        }
      }
      setOrder(null);
      setError('Order details are no longer available. Please contact the restaurant.');
    } catch {
      setError('Could not load your order.');
    } finally {
      setLoading(false);
    }
  }, [orderId, session, navigate]);

  if (loading) {
    return (
      <div className="tracking-screen loading">
        <Spinner size="large" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="tracking-screen error">
        <p>{error}</p>
        <Button onClick={() => navigate('/menu')}>Back to Menu</Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="tracking-screen empty">
        <p>Order not found</p>
        <Button onClick={() => navigate('/menu')}>Back to Menu</Button>
      </div>
    );
  }

  const status = order.orderStatus || 'pending_payment';
  const isCancelled = status === 'cancelled';
  const isCompleted = status === 'completed';
  const currentStatusIndex = STATUS_FLOW.indexOf(status);

  return (
    <div className="tracking-screen">
      <div className="success-hero">
        <div className="success-icon">✓</div>
        <h1>{isCancelled ? 'Order Cancelled' : isCompleted ? 'Order Completed' : 'Order Placed!'}</h1>
        <p className="success-sub">
          {isCancelled
            ? 'Your order was cancelled.'
            : isCompleted
              ? 'Your order has been delivered. Enjoy!'
              : 'Your order has been received by the kitchen.'}
        </p>
        <div className="order-ref">
          Order <strong>#{order.orderNumber || order._id?.slice(-6)}</strong>
        </div>
      </div>

      <Card className="status-card">
        <div className="status-timeline">
          {STATUS_FLOW.map((s, index) => (
            <StatusStep
              key={s}
              label={STATUS_LABELS[s]}
              status={getStepStatus(index, currentStatusIndex, isCancelled)}
              isLast={index === STATUS_FLOW.length - 1}
            />
          ))}
        </div>
        <div className="current-status">
          <Badge variant={STATUS_COLORS[status] || 'secondary'}>
            {STATUS_LABELS[status] || status}
          </Badge>
        </div>
      </Card>

      <Card className="order-details">
        <h3>Order Details</h3>
        <div className="order-items">
          {order.items?.map((item, idx) => (
            <div key={idx} className="order-item">
              <div className="item-info">
                <span className="item-name">{item.nameSnapshot || item.name}</span>
                {item.notes && <span className="item-notes">{item.notes}</span>}
              </div>
              <div className="item-qty-price">
                <span className="item-qty">×{item.quantity}</span>
                <span className="item-price">₹{(item.priceSnapshot ?? item.price) * item.quantity}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="order-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          {order.tax > 0 && (
            <div className="summary-row">
              <span>Tax</span>
              <span>₹{order.tax}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>
        <div className="order-meta-details">
          {order.orderType === 'dine-in' && (
            <div className="meta-item">
              <span className="meta-label">Table</span>
              <span className="meta-value">{order.tableNumber || order.tableId || '—'}</span>
            </div>
          )}
          <div className="meta-item">
            <span className="meta-label">Payment</span>
            <span className="meta-value">
              {order.paymentMethod === 'online' ? 'Online' : 'Cash at Counter'}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Payment Status</span>
            <span className="meta-value">
              <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                {order.paymentStatus || 'pending'}
              </Badge>
            </span>
          </div>
        </div>
      </Card>

      {(isCompleted || isCancelled) && (
        <div className="completed-actions">
          <Button variant="secondary" onClick={() => navigate('/menu')}>
            Back to Menu
          </Button>
          <Button onClick={() => navigate('/menu')}>
            Order Again
          </Button>
        </div>
      )}
    </div>
  );
}

function getStepStatus(index, currentIndex, isCancelled) {
  if (isCancelled) return 'cancelled';
  if (index < currentIndex) return 'completed';
  if (index === currentIndex) return 'current';
  return 'pending';
}

function StatusStep({ label, status, isLast }) {
  return (
    <div className={`timeline-step ${status}`}>
      <div className="step-marker">
        <div className="step-circle">
          {status === 'completed' && '✓'}
          {status === 'current' && <div className="pulse-ring" />}
        </div>
        {!isLast && <div className="step-line" />}
      </div>
      <div className="step-label">{label}</div>
    </div>
  );
}