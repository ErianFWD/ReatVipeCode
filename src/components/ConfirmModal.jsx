import { useEffect } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ConfirmModal({ open, title, message, loading = false, onConfirm, onCancel }) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) onCancel();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-modal-overlay" role="presentation" onMouseDown={() => !loading && onCancel()}>
      <section
        className="confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="confirm-modal-close"
          type="button"
          onClick={onCancel}
          aria-label={t('confirmation.close')}
          disabled={loading}
        >
          <FiX />
        </button>

        <div className="confirm-modal-icon" aria-hidden="true">
          <FiAlertTriangle />
        </div>

        <span className="confirm-modal-kicker">{t('confirmation.kicker')}</span>
        <h2 id="confirm-modal-title">{title}</h2>
        <p id="confirm-modal-message">{message}</p>

        <div className="confirm-modal-actions">
          <button
            className="button confirm-modal-cancel"
            type="button"
            onClick={onCancel}
            disabled={loading}
            autoFocus
          >
            {t('confirmation.cancel')}
          </button>
          <button className="button confirm-modal-accept" type="button" onClick={onConfirm} disabled={loading}>
            {loading ? t('confirmation.processing') : t('confirmation.accept')}
          </button>
        </div>
      </section>
    </div>
  );
}
