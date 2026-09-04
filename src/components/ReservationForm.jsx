import { useMemo, useState } from 'react';
import ErrorMessage from './ErrorMessage.jsx';

const todayISO = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export default function ReservationForm({ user, onSubmit, submitting }) {
  const [form, setForm] = useState({
    serviceType: 'hotel',
    guestName: user.name,
    email: user.email,
    phone: '',
    date: '',
    time: '',
    guests: 2,
    roomType: 'Habitación Estándar',
    nights: 1,
    tableArea: 'Interior',
    notes: '',
  });
  const [error, setError] = useState('');

  const timeOptions = useMemo(
    () => form.serviceType === 'hotel'
      ? ['14:00', '15:00', '16:00', '17:00']
      : ['12:00', '12:30', '13:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'],
    [form.serviceType],
  );

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'guests' || name === 'nights' ? Number(value) : value,
      ...(name === 'serviceType' ? { time: '' } : {}),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.guestName.trim() || !form.email.trim() || !form.phone.trim() || !form.date || !form.time) {
      setError('Completa todos los campos obligatorios.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Ingresa un correo válido.');
      return;
    }
    if (form.phone.replace(/\D/g, '').length < 8) {
      setError('Ingresa un teléfono válido.');
      return;
    }
    if (form.date < todayISO()) {
      setError('La fecha no puede ser anterior al día actual.');
      return;
    }
    if (form.guests < 1) {
      setError('Debe existir al menos una persona en la reserva.');
      return;
    }
    if (form.serviceType === 'hotel' && form.nights < 1) {
      setError('La estancia debe ser de al menos una noche.');
      return;
    }

    await onSubmit({
      ...form,
      guestName: form.guestName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      notes: form.notes.trim(),
      roomType: form.serviceType === 'hotel' ? form.roomType : '',
      nights: form.serviceType === 'hotel' ? form.nights : 0,
      tableArea: form.serviceType === 'restaurant' ? form.tableArea : '',
    });
  };

  return (
    <form className="reservation-form" onSubmit={submit}>
      <div className="service-selector">
        <label className={form.serviceType === 'hotel' ? 'selected' : ''}>
          <input type="radio" name="serviceType" value="hotel" checked={form.serviceType === 'hotel'} onChange={update} />
          <span>Hotel Boutique</span>
          <small>Habitaciones premium y suites.</small>
        </label>
        <label className={form.serviceType === 'restaurant' ? 'selected' : ''}>
          <input type="radio" name="serviceType" value="restaurant" checked={form.serviceType === 'restaurant'} onChange={update} />
          <span>Restaurante</span>
          <small>Interior, terraza o área VIP.</small>
        </label>
      </div>

      <ErrorMessage message={error} />

      <div className="form-grid">
        <label className="field">
          <span>Nombre *</span>
          <input name="guestName" value={form.guestName} onChange={update} />
        </label>
        <label className="field">
          <span>Correo *</span>
          <input type="email" name="email" value={form.email} onChange={update} />
        </label>
        <label className="field">
          <span>Teléfono *</span>
          <input name="phone" value={form.phone} onChange={update} placeholder="8888-8888" />
        </label>
        <label className="field">
          <span>Personas *</span>
          <input type="number" name="guests" min="1" max="20" value={form.guests} onChange={update} />
        </label>
        <label className="field">
          <span>Fecha *</span>
          <input type="date" name="date" min={todayISO()} value={form.date} onChange={update} />
        </label>
        <label className="field">
          <span>Hora *</span>
          <select name="time" value={form.time} onChange={update}>
            <option value="">Seleccionar</option>
            {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
          </select>
        </label>

        {form.serviceType === 'hotel' ? (
          <>
            <label className="field">
              <span>Tipo de habitación *</span>
              <select name="roomType" value={form.roomType} onChange={update}>
                <option>Habitación Estándar</option>
                <option>Habitación Premium</option>
                <option>Suite Deluxe</option>
              </select>
            </label>
            <label className="field">
              <span>Noches *</span>
              <input type="number" name="nights" min="1" max="21" value={form.nights} onChange={update} />
            </label>
          </>
        ) : (
          <label className="field full">
            <span>Área *</span>
            <select name="tableArea" value={form.tableArea} onChange={update}>
              <option>Interior</option>
              <option>Terraza</option>
              <option>VIP</option>
            </select>
          </label>
        )}

        <label className="field full">
          <span>Notas</span>
          <textarea name="notes" value={form.notes} onChange={update} maxLength="300" placeholder="Preferencias, alergias, ocasión especial..." />
        </label>
      </div>

      <button className="button primary large" type="submit" disabled={submitting}>
        {submitting ? 'Guardando...' : 'Confirmar solicitud'}
      </button>
    </form>
  );
}
