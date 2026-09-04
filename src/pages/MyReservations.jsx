import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCalendar, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { getUserReservations, updateReservation } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ReservationCard from '../components/ReservationCard.jsx';

export default function MyReservations() {
  const { user } = useAuth();
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
    if (!window.confirm('¿Cancelar esta reserva?')) return;
    setError('');
    try {
      await updateReservation(id, { status: 'Cancelada' });
      setReservations((current) => current.map((item) => item.id === id ? { ...item, status: 'Cancelada' } : item));
      setMessage('Reserva cancelada correctamente.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader text="Cargando tus reservas..." />;

  return (
    <main className="inner-page">
      <section className="page-hero compact-hero">
        <div className="container page-title-row">
          <div>
            <span className="eyebrow"><FiCalendar /> ÁREA DE CLIENTE</span>
            <h1>Mis reservas.</h1>
            <p>Aquí solo aparecen las reservas cuyo ownerId corresponde a tu usuario.</p>
          </div>
          <Link className="button light" to="/reservar"><FiPlus /> Nueva reserva</Link>
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
              <h2>Aún no tienes reservas.</h2>
              <p>Crea tu primera reserva de hotel o restaurante.</p>
              <Link className="button primary" to="/reservar">Crear reserva</Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
