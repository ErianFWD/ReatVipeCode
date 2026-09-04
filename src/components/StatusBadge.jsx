export default function StatusBadge({ status }) {
  const normalized = status?.toLowerCase() || 'pendiente';
  return <span className={`status-badge status-${normalized}`}>{status}</span>;
}
