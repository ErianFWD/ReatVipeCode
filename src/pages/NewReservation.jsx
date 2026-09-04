import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { createReservation } from '../services/api.js';
import ReservationForm from '../components/ReservationForm.jsx';

export default function NewReservation() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const submit = async (form) => {
    setSubmitting(true);
    setServerError('');
    try {
      await createReservation({
        ...form,
        ownerId: user.id,
        status: 'Pendiente',
      });
      navigate('/mis-reservas', { state: { message: t('reservations.successCreate') } });
    } catch (error) {
      setServerError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="inner-page">
      <section className="page-hero compact-hero">
        <div className="container">
          <span className="eyebrow"><FiCalendar /> {t('reservations.createTitle')}</span>
          <h1>{t('reservations.createTitle')}</h1>
          <p>{t('reservations.createSubtitle')}</p>
        </div>
      </section>

      <section className="section reservation-section">
        <div className="container reservation-layout">
          <aside className="reservation-aside">
            <span className="eyebrow dark">ARENAL KIORO SUITES</span>
            <h2>{t('home.heroTitle')}</h2>
            <p>{t('home.heroDesc')}</p>
            <div className="aside-note">
              <strong>{t('dashboard.statusOverview')}</strong>
              <span>{t('reservations.statusPending')}</span>
              <small>{t('reservations.adminSubtitle')}</small>
            </div>
          </aside>
          <div className="form-panel">
            {serverError && <div className="message error-message">{serverError}</div>}
            <ReservationForm user={user} onSubmit={submit} submitting={submitting} />
          </div>
        </div>
      </section>
    </main>
  );
}
