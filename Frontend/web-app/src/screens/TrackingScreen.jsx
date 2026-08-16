import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerSession } from '../context/CustomerSessionContext';
import { customerApi, orderApi } from '../api/client';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import './TrackingScreen.css';

const STATUS_ORDER = ['placed', 'accepted', 'preparing', 'ready', 'served', 'completed'];
const STATUS_LABELS = {
  placed: 'Order Placed',
  accepted: 'Order Accepted',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  served: 'Served',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
const STATUS_COLORS = {
  placed: 'secondary',
  accepted: 'primary',
  preparing: 'warning',
  ready: 'primary',
  served: 'success',
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
  const [polling, setPolling] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const data = await orderApi.getOrder(orderId);
      setOrder(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    if (!polling) {
      setPolling(true);
      const interval = setInterval(fetchOrder, 10000);
      return () => {
        clearInterval(interval);
        setPolling(false);
      };
    }
  }, [fetchOrder, polling]);

  useEffect(() => {
    if (!session) {
      navigate('/scan', { replace: true });
    }
  }, [session, navigate]);

  if (loading && !order) {
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
        <Button onClick={fetchOrder}>Retry</Button>
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

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  const isCompleted = ['completed', 'cancelled'].includes(order.status);

  return (
    <div className="tracking-screen">
      <header className="tracking-header">
        <Button variant="ghost" size="sm" onClick={() => navigate('/menu')}>
          ← Menu
        </Button>
        <h1>Order Tracking</h1>
        <div className="order-meta">
          <span>#{order.orderNumber || order._id?.slice(-6)}</span>
          <span>{new Date(order.placedAt).toLocaleString()}</span>
        </div>
      </header>

      <Card className="status-card">
        <div className="status-timeline">
          {STATUS_ORDER.map((status, index) => (
            <StatusStep
              key={status}
              label={STATUS_LABELS[status]}
              status={getStepStatus(index, currentStatusIndex, order.status)}
              isLast={index === STATUS_ORDER.length - 1}
            />
          ))}
        </div>
        <div className="current-status">
          <Badge variant={STATUS_COLORS[order.status] || 'secondary'} size="lg">
            {STATUS_LABELS[order.status] || order.status}
          </Badge>
        </div>
      </Card>

      <Card className="order-details">
        <h3>Order Details</h3>
        <div className="order-items">
          {order.items?.map((item, idx) => (
            <div key={idx} className="order-item">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                {item.notes && <span className="item-notes">{item.notes}</span>}
              </div>
              <div className="item-qty-price">
                <span className="item-qty">×{item.quantity}</span>
                <span className="item-price">₹{item.price * item.quantity}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="order-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{order.subtotal || order.totalAmount}</span>
          </div>
          {order.tax && order.tax > 0 && (
            <div className="summary-row">
              <span>Tax</span>
              <span>₹{order.tax}</span>
            </div>
          )}
          {order.serviceCharge && order.serviceCharge > 0 && (
            <div className="summary-row">
              <span>Service Charge</span>
              <span>₹{order.serviceCharge}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total Paid</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
        <div className="order-meta-details">
          <div className="meta-item">
            <span className="meta-label">Table</span>
            <span className="meta-value">{order.table?.tableNumber || '—'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Payment</span>
            <span className="meta-value">
              {order.paymentMethod === 'online' ? 'Online' : 'Cash at Counter'}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Payment Status</span>
            <span className="meta-value">
              <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'} size="sm">
                {order.paymentStatus}
              </Badge>
            </span>
          </div>
        </div>
      </Card>

      {isCompleted && (
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

function getStepStatus(index, currentIndex, currentStatus) {
  if (index < currentIndex) return 'completed';
  if (index === currentIndex) return 'current';
  if (currentStatus === 'cancelled' && index > currentIndex) return 'cancelled';
  return 'pending';
}

function StatusStep({ label, status, isLast }) {
  return (
    <div className={`timeline-step ${status}`}>
      <div className="step-marker">
        <div className="step-circle">
          {status === 'completed' && '✓'}
          {status === 'current' && (
            <div className="pulse-ring" />
          )}
        </div>
        {!isLast && <div className="step-line" />}
      </div>
      <div className="step-label">{label}</div>
    </div>
  );
}