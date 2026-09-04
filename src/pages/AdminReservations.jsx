import { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiFilter, FiSearch, FiX } from 'react-icons/fi';
import { getReservations, getUsers, updateReservation } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getReservations(), getUsers()])
      .then(([reservationData, userData]) => {
        if (!active) return;
        setReservations(reservationData);
        setUsers(userData);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const userMap = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user])),
    [users],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reservations.filter((reservation) => {
      const byStatus = statusFilter === 'Todas' || reservation.status === statusFilter;
      const byType = typeFilter === 'Todos' || reservation.serviceType === typeFilter;
      const bySearch = !q || `${reservation.guestName} ${reservation.email} ${reservation.phone}`.toLowerCase().includes(q);
      return byStatus && byType && bySearch;
    });
  }, [reservations, statusFilter, typeFilter, search]);

  const changeStatus = async (id, status) => {
    const verb = status === 'Confirmada' ? 'confirmar' : 'cancelar';
    if (!window.confirm(`¿Deseas ${verb} esta reserva?`)) return;
    setError('');
    setMessage('');
    try {
      await updateReservation(id, { status });
      setReservations((current) => current.map((item) => item.id === id ? { ...item, status } : item));
      setMessage(status === 'Confirmada' ? 'Reserva confirmada.' : 'Reserva cancelada.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader text="Cargando reservas..." />;

  return (
    <main className="inner-page admin-page">
      <section className="page-hero compact-hero admin-subhero">
        <div className="container">
          <span className="eyebrow">ADMINISTRACIÓN</span>
          <h1>Gestión de reservas.</h1>
          <p>Consulta, filtra y actualiza el estado de todas las solicitudes.</p>
        </div>
      </section>

      <section className="section dashboard-content">
        <div className="container">
          {message && <div className="message success-message">{message}</div>}
          <ErrorMessage message={error} />

          <div className="admin-toolbar">
            <label className="search-control">
              <FiSearch />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar nombre, correo o teléfono" />
            </label>
            <label className="filter-control">
              <FiFilter />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>Todas</option>
                <option>Pendiente</option>
                <option>Confirmada</option>
                <option>Cancelada</option>
              </select>
            </label>
            <label className="filter-control">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="Todos">Todos los servicios</option>
                <option value="hotel">Hotel</option>
                <option value="restaurant">Restaurante</option>
              </select>
            </label>
          </div>

          <div className="table-summary"><strong>{filtered.length}</strong> reserva{filtered.length === 1 ? '' : 's'} mostrada{filtered.length === 1 ? '' : 's'}</div>

          <div className="table-scroll admin-table-wrap">
            <table className="data-table admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Cliente</th><th>Tipo</th><th>Detalle</th><th>Fecha</th><th>Hora</th><th>Personas</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((reservation) => {
                  const owner = userMap[reservation.ownerId];
                  return (
                    <tr key={reservation.id}>
                      <td>#{reservation.id}</td>
                      <td><strong>{reservation.guestName}</strong><small>{owner?.email || reservation.email}</small></td>
                      <td>{reservation.serviceType === 'hotel' ? 'Hotel' : 'Restaurante'}</td>
                      <td>{reservation.serviceType === 'hotel' ? `${reservation.roomType} · ${reservation.nights} noche(s)` : reservation.tableArea}</td>
                      <td>{reservation.date}</td>
                      <td>{reservation.time}</td>
                      <td>{reservation.guests}</td>
                      <td><StatusBadge status={reservation.status} /></td>
                      <td>
                        <div className="table-actions">
                          {reservation.status === 'Pendiente' && <button className="action-icon success" title="Confirmar" onClick={() => changeStatus(reservation.id, 'Confirmada')}><FiCheck /></button>}
                          {reservation.status !== 'Cancelada' && <button className="action-icon danger" title="Cancelar" onClick={() => changeStatus(reservation.id, 'Cancelada')}><FiX /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!filtered.length && <div className="empty-state small-empty"><FiSearch /><h2>Sin resultados</h2><p>Cambia los filtros o la búsqueda.</p></div>}
        </div>
      </section>
    </main>
  );
}
