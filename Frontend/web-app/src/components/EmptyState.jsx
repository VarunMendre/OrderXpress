import './EmptyState.css';

export default function EmptyState({ icon = '🗒️', title, message, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      {message && <p className="empty-message">{message}</p>}
      {actionLabel && onAction && (
        <button className="empty-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}