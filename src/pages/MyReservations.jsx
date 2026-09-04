import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCalendar, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getUserReservations, updateReservation } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ReservationCard from '../components/ReservationCard.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

export default function MyReservations() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setReservations(await getUserReservations(user.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user.id]);

  const cancel = (id) => setReservationToCancel(id);

  const confirmCancel = async () => {
    if (reservationToCancel === null) return;
    setCancelling(true);
    setError('');
    try {
      await updateReservation(reservationToCancel, { status: 'Cancelada' });
      setReservations((current) => current.map((item) => item.id === reservationToCancel ? { ...item, status: 'Cancelada' } : item));
      setMessage(t('reservations.statusCancelled'));
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
      setReservationToCancel(null);
    }
  };

  if (loading) return <Loader text={t('common.loading')} />;

  return (
    <main className="inner-page">
      <section className="page-hero compact-hero">
        <div className="container page-title-row">
          <div>
            <span className="eyebrow"><FiCalendar /> {t('nav.clientBadge')}</span>
            <h1>{t('reservations.title')}</h1>
            <p>{t('reservations.subtitle')}</p>
          </div>
          <Link className="button light" to="/reservar"><FiPlus /> {t('dashboard.newBooking')}</Link>
        </div>
      </section>

      <section className="section light-section">
        <div className="container">
          {message && <div className="message success-message">{message}</div>}
          <ErrorMessage message={error} />

          {reservations.length ? (
            <div className="reservations-grid">
              {reservations.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} onCancel={cancel} />)}
            </div>
          ) : (
            <div className="empty-state">
              <FiCalendar />
              <h2>{t('reservations.emptyTitle')}</h2>
              <p>{t('reservations.emptyDesc')}</p>
              <Link className="button primary" to="/reservar">{t('reservations.makeFirstBooking')}</Link>
            </div>
          )}
        </div>
      </section>

      <ConfirmModal
        open={reservationToCancel !== null}
        title={t('confirmation.cancelReservationTitle')}
        message={t('confirmation.cancelReservationMessage')}
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setReservationToCancel(null)}
      />
    </main>
  );
}
