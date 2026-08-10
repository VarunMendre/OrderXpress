import './Input.css';

export default function Input({ label, error, multiline = false, className = '', style, ...rest }) {
  const Comp = multiline ? 'textarea' : 'input';
  return (
    <div className={`field ${className}`} style={style}>
      {label && <label className="field-label">{label}</label>}
      <Comp
        className={`field-input ${error ? 'field-error' : ''} ${multiline ? 'field-textarea' : ''}`}
        {...rest}
      />
      {error && <p className="field-msg">{error}</p>}
    </div>
  );
}