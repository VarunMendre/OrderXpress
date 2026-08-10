import './styles/global.css';
import './styles/welcome.css';
import AppHeader from './components/AppHeader';

const WELCOME_STEPS = [
  { key: 'scan', icon: '📱', title: 'Scan the QR', text: 'Scan the QR code on your table to open the menu.' },
  { key: 'order', icon: '🍽️', title: 'Browse & order', text: 'Pick your favourite dishes and add them to cart.' },
  { key: 'pay', icon: '💳', title: 'Pay & track', text: 'Pay online or at counter and track your order live.' },
];

export default function App() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <div className="welcome">
          <div className="welcome-logo">OX</div>
          <h2 className="welcome-title">Welcome to OrderXpress</h2>
          <p className="welcome-sub">Fresh food, fast service — scan the QR at your table to start.</p>
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