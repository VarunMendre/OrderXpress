import './AppHeader.css';

export default function AppHeader({ right }) {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <div className="app-logo">OX</div>
        <h1 className="app-title">
          Order<span>Xpress</span>
        </h1>
      </div>
      {right && <div className="app-header-right">{right}</div>}
    </header>
  );
}