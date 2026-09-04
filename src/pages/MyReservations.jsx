import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCalendar, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getUserReservations, updateReservation } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ReservationCard from '../components/ReservationCard.jsx';

export default function MyReservations() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');

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

  const cancel = async (id) => {
    if (!window.confirm(t('reservations.confirmPrompt'))) return;
    setError('');
    try {
      await updateReservation(id, { status: 'Cancelada' });
      setReservations((current) => current.map((item) => item.id === id ? { ...item, status: 'Cancelada' } : item));
      setMessage(t('reservations.statusCancelled'));
    } catch (err) {
      setError(err.message);
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
    </main>
  );
}
