export const AVATAR_COLORS = [
  '#10B981',
  '#7C5CFC',
  '#EC4899',
  '#F59E0B',
  '#2DD4BF',
  '#EF4444',
  '#8B5CF6',
  '#F97316',
  '#06B6D4',
  '#14B8A6',
];

export function avatarColor(index = 0) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const then = new Date(dateStr).getTime();
  const diff = Date.now() - then;
  if (isNaN(diff) || diff < 0) return 'just now';
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

export function formatCurrency(value) {
  const n = Number(value || 0);
  return `₹${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

export function orderNumber(order) {
  return (
    order.orderNumber ||
    order.orderId?.slice(-6) ||
    order._id?.slice(-6) ||
    '—'
  );
}

export function orderCustomerName(order) {
  return order.customerName || `Table ${order.tableNumber || order.tableId || '—'}`;
}

export function orderProductsLine(order, max = 3) {
  const items = Array.isArray(order.items) ? order.items : [];
  const names = items.map((i) => i.nameSnapshot || i.name).filter(Boolean);
  if (names.length > 0) {
    const shown = names.slice(0, max);
    const rest = names.length - shown.length;
    return shown.join(', ') + (rest > 0 ? ` +${rest} more` : '');
  }
  if (order.tableNumber || order.tableId) {
    return `Table ${order.tableNumber || order.tableId}`;
  }
  return `${items.length || order.itemCount || 0} items`;
}

export function orderStatusInfo(order) {
  const status = order.status || order.orderStatus || 'pending_payment';
  const map = {
    draft: { label: 'Draft', variant: 'secondary' },
    pending_payment: { label: 'Pending', variant: 'warning' },
    accepted: { label: 'Processing', variant: 'info' },
    paid: { label: 'Paid', variant: 'success' },
    completed: { label: 'Completed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'danger' },
  };
  return map[status] || { label: status, variant: 'secondary' };
}