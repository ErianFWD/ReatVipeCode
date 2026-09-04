import { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiFilter, FiSearch, FiX } from 'react-icons/fi';
import { getReservations, getUsers, updateReservation } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

export default function AdminReservations() {
  const { t } = useLanguage();
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

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
    if (status === 'Cancelada') {
      setReservationToCancel(id);
      return;
    }

    const verb = status === 'Confirmada' ? t('reservations.confirmAction') : t('reservations.cancelAction');
    if (!window.confirm(`${verb}?`)) return;
    setError('');
    setMessage('');
    try {
      await updateReservation(id, { status });
      setReservations((current) => current.map((item) => item.id === id ? { ...item, status } : item));
      setMessage(status === 'Confirmada' ? t('reservations.statusConfirmed') : t('reservations.statusCancelled'));
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmCancellation = async () => {
    if (reservationToCancel === null) return;
    setCancelling(true);
    setError('');
    setMessage('');
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
    <main className="inner-page admin-page">
      <section className="page-hero compact-hero admin-subhero">
        <div className="container">
          <span className="eyebrow">{t('nav.adminBadge')}</span>
          <h1>{t('reservations.adminTitle')}</h1>
          <p>{t('reservations.adminSubtitle')}</p>
        </div>
      </section>

      <section className="section dashboard-content">
        <div className="container">
          {message && <div className="message success-message">{message}</div>}
          <ErrorMessage message={error} />

          <div className="admin-toolbar">
            <label className="search-control">
              <FiSearch />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('reservations.searchPlaceholder')} />
            </label>
            <label className="filter-control">
              <FiFilter />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="Todas">{t('reservations.filterAll')}</option>
                <option value="Pendiente">{t('reservations.filterPending')}</option>
                <option value="Confirmada">{t('reservations.filterConfirmed')}</option>
                <option value="Cancelada">{t('reservations.filterCancelled')}</option>
              </select>
            </label>
            <label className="filter-control">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="Todos">{t('common.all')}</option>
                <option value="hotel">{t('common.hotel')}</option>
                <option value="restaurant">{t('common.restaurant')}</option>
              </select>
            </label>
          </div>

          <div className="table-summary"><strong>{filtered.length}</strong> {t('reservations.title')}</div>

          <div className="table-scroll admin-table-wrap">
            <table className="data-table admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>{t('users.colName')}</th><th>{t('reservations.serviceType')}</th><th>Detalle</th><th>{t('reservations.date')}</th><th>{t('reservations.time')}</th><th>{t('reservations.guests')}</th><th>{t('dashboard.statusOverview')}</th><th>{t('users.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((reservation) => {
                  const owner = userMap[reservation.ownerId];
                  return (
                    <tr key={reservation.id}>
                      <td>#{reservation.id}</td>
                      <td><strong>{reservation.guestName}</strong><small>{owner?.email || reservation.email}</small></td>
                      <td>{reservation.serviceType === 'hotel' ? t('common.hotel') : t('common.restaurant')}</td>
                      <td>{reservation.serviceType === 'hotel' ? `${reservation.roomType} · ${reservation.nights} Noches/Nights` : reservation.tableArea}</td>
                      <td>{reservation.date}</td>
                      <td>{reservation.time}</td>
                      <td>{reservation.guests}</td>
                      <td><StatusBadge status={reservation.status} /></td>
                      <td>
                        <div className="table-actions">
                          {reservation.status === 'Pendiente' && <button className="action-icon success" title={t('reservations.confirmAction')} onClick={() => changeStatus(reservation.id, 'Confirmada')}><FiCheck /></button>}
                          {reservation.status !== 'Cancelada' && <button className="action-icon danger" title={t('reservations.cancelAction')} onClick={() => changeStatus(reservation.id, 'Cancelada')}><FiX /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!filtered.length && <div className="empty-state small-empty"><FiSearch /><h2>{t('reservations.emptyTitle')}</h2><p>{t('reservations.emptyDesc')}</p></div>}
        </div>
      </section>

      <ConfirmModal
        open={reservationToCancel !== null}
        title={t('confirmation.cancelReservationTitle')}
        message={t('confirmation.cancelReservationMessage')}
        loading={cancelling}
        onConfirm={confirmCancellation}
        onCancel={() => setReservationToCancel(null)}
      />
    </main>
  );
}
