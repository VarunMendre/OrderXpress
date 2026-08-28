import './Badge.css';

export default function Badge({ label, children, variant = 'neutral', dot = false }) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span className="badge-dot" />}
      {label ?? children}
    </span>
  );
}