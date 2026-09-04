import { FiCalendar, FiClock, FiHome, FiMapPin, FiUsers } from 'react-icons/fi';
import StatusBadge from './StatusBadge.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ReservationCard({ reservation, onCancel }) {
  const { t } = useLanguage();
  const hotel = reservation.serviceType === 'hotel';

  return (
    <article className="reservation-card">
      <div className="reservation-card-head">
        <div>
          <span className="reservation-type">{hotel ? t('reservations.hotelOption') : t('reservations.restaurantOption')}</span>
          <h3>{hotel ? reservation.roomType : reservation.tableArea}</h3>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      <div className="reservation-meta">
        <span><FiCalendar /> {reservation.date}</span>
        <span><FiClock /> {reservation.time}</span>
        <span><FiUsers /> {reservation.guests} {t('reservations.guests')}</span>
        {hotel ? <span><FiHome /> {reservation.nights} Noches / Nights</span> : <span><FiMapPin /> {reservation.tableArea}</span>}
      </div>

      {reservation.notes && <p className="reservation-notes">“{reservation.notes}”</p>}

      {onCancel && reservation.status === 'Pendiente' && (
        <button className="button danger-outline" onClick={() => onCancel(reservation.id)}>{t('reservations.cancelAction')}</button>
      )}
    </article>
  );
}
