import './Button.css';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  loading = false,
  disabled = false,
  style,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${className}`}
      style={style}
    >
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : children}
    </button>
  );
}