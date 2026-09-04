import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { createReservation } from '../services/api.js';
import ReservationForm from '../components/ReservationForm.jsx';

export default function NewReservation() {
  const { user } = useAuth();
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
      navigate('/mis-reservas', { state: { message: 'Reserva creada correctamente.' } });
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
          <span className="eyebrow"><FiCalendar /> NUEVA RESERVA</span>
          <h1>Planea tu próxima experiencia.</h1>
          <p>Elige hotel o restaurante y completa los datos de tu solicitud.</p>
        </div>
      </section>

      <section className="section reservation-section">
        <div className="container reservation-layout">
          <aside className="reservation-aside">
            <span className="eyebrow dark">RESERVAPRO</span>
            <h2>Todo desde la misma cuenta.</h2>
            <p>La reserva quedará asociada automáticamente a tu usuario mediante <strong>ownerId</strong>.</p>
            <div className="aside-note">
              <strong>Estado inicial</strong>
              <span>Pendiente</span>
              <small>El administrador podrá confirmarla o cancelarla.</small>
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
