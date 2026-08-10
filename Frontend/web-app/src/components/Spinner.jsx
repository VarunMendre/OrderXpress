import './Spinner.css';

export default function Spinner({ label = 'Loading...', fullscreen = false }) {
  return (
    <div className={`spinner ${fullscreen ? 'spinner-fullscreen' : ''}`}>
      <span className="spinner-ring" aria-hidden="true" />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
}