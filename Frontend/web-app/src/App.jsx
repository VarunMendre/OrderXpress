import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { CustomerSessionProvider } from './context/CustomerSessionContext';
import { CartProvider } from './context/CartContext';
import ScanSessionScreen from './screens/ScanSessionScreen';
import MenuScreen from './screens/MenuScreen';
import CartScreen from './screens/CartScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import TrackingScreen from './screens/TrackingScreen';
import './styles/global.css';
import './styles/welcome.css';
import AppHeader from './components/AppHeader';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/scan" element={<ScanSessionScreen />} />
      <Route path="/menu" element={<MenuScreen />} />
      <Route path="/cart" element={<CartScreen />} />
      <Route path="/checkout" element={<CheckoutScreen />} />
      <Route path="/tracking/:orderId" element={<TrackingScreen />} />
      <Route path="/" element={<WelcomeScreen />} />
    </Routes>
  );
}

const ORDER_TYPE_KEY = 'orderxpress.orderType';

function WelcomeScreen() {
  const navigate = useNavigate();
  const WELCOME_STEPS = [
    { key: 'scan', icon: '📱', title: 'Scan the QR', text: 'Scan the QR code on your table to open the menu.' },
    { key: 'order', icon: '🍽️', title: 'Browse & order', text: 'Pick your favourite dishes and add them to cart.' },
    { key: 'pay', icon: '💳', title: 'Pay & track', text: 'Pay online or at counter and track your order live.' },
  ];

  const startOrder = (orderType) => {
    sessionStorage.setItem(ORDER_TYPE_KEY, orderType);
    navigate('/scan');
  };

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <div className="welcome">
          <div className="welcome-logo">OX</div>
          <h2 className="welcome-title">Welcome to OrderXpress</h2>
          <p className="welcome-sub">Fresh food, fast service — choose how you'd like to order.</p>
          <div className="welcome-order-types">
            <button className="order-type-card" onClick={() => startOrder('dine-in')}>
              <span className="order-type-icon">🍽️</span>
              <div>
                <h4>Dine In</h4>
                <p>Order from your table</p>
              </div>
            </button>
            <button className="order-type-card" onClick={() => startOrder('takeaway')}>
              <span className="order-type-icon">🛍️</span>
              <div>
                <h4>Take Away</h4>
                <p>Pick up your order</p>
              </div>
            </button>
          </div>
          <div className="welcome-steps">
            {WELCOME_STEPS.map((s) => (
              <div className="welcome-step" key={s.key}>
                <span className="welcome-step-icon">{s.icon}</span>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CustomerSessionProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </CustomerSessionProvider>
    </BrowserRouter>
  );
}