import { FiCalendar, FiClock, FiHome, FiMapPin, FiUsers } from 'react-icons/fi';
import StatusBadge from './StatusBadge.jsx';

export default function ReservationCard({ reservation, onCancel }) {
  const hotel = reservation.serviceType === 'hotel';

  return (
    <article className="reservation-card">
      <div className="reservation-card-head">
        <div>
          <span className="reservation-type">{hotel ? 'Hotel Boutique' : 'Restaurante'}</span>
          <h3>{hotel ? reservation.roomType : reservation.tableArea}</h3>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      <div className="reservation-meta">
        <span><FiCalendar /> {reservation.date}</span>
        <span><FiClock /> {reservation.time}</span>
        <span><FiUsers /> {reservation.guests} persona{reservation.guests === 1 ? '' : 's'}</span>
        {hotel ? <span><FiHome /> {reservation.nights} noche{reservation.nights === 1 ? '' : 's'}</span> : <span><FiMapPin /> {reservation.tableArea}</span>}
      </div>

      {reservation.notes && <p className="reservation-notes">“{reservation.notes}”</p>}

      {onCancel && reservation.status === 'Pendiente' && (
        <button className="button danger-outline" onClick={() => onCancel(reservation.id)}>Cancelar reserva</button>
      )}
    </article>
  );
}
