import { useLanguage } from '../context/LanguageContext.jsx';

export default function StatusBadge({ status }) {
  const { t } = useLanguage();
  const normalized = status?.toLowerCase() || 'pendiente';
  
  let label = status;
  if (normalized === 'pendiente') label = t('reservations.statusPending');
  else if (normalized === 'confirmada') label = t('reservations.statusConfirmed');
  else if (normalized === 'cancelada') label = t('reservations.statusCancelled');

  return <span className={`status-badge status-${normalized}`}>{label}</span>;
}
