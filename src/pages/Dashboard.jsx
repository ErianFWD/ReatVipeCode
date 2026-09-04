import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FiCalendar, FiCheckCircle, FiClock, FiCoffee, FiHome, FiUsers, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getReservations, getUserReservations, getUsers } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const COLORS = ['#b8914b', '#44634a', '#a44949'];

export default function Dashboard() {
  const { user } = useAuth();
  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
}

function UserDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getUserReservations(user.id)
      .then((data) => active && setReservations(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user.id]);

  const pending = reservations.filter((r) => r.status === 'Pendiente').length;
  const confirmed = reservations.filter((r) => r.status === 'Confirmada').length;
  const cancelled = reservations.filter((r) => r.status === 'Cancelada').length;
  const today = new Date().toISOString().slice(0, 10);
  const nextReservation = reservations.find((r) => r.status !== 'Cancelada' && r.date >= today);

  if (loading) return <Loader text={t('common.loading')} />;

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome user-welcome">
        <div className="container welcome-inner">
          <div>
            <span className="eyebrow">{t('nav.clientBadge')}</span>
            <h1>{t('dashboard.welcome')} {user.name.split(' ')[0]}.</h1>
            <p>{t('dashboard.subtitle')}</p>
          </div>
          <Link className="button light large" to="/reservar">{t('dashboard.newBooking')}</Link>
        </div>
      </section>

      <section className="section dashboard-content">
        <div className="container">
          <ErrorMessage message={error} />
          <div className="stats-grid four">
            <StatCard icon={<FiCalendar />} label={t('reservations.title')} value={reservations.length} helper={t('dashboard.totalReservations')} />
            <StatCard icon={<FiClock />} label={t('dashboard.pendingReservations')} value={pending} helper={t('reservations.statusPending')} />
            <StatCard icon={<FiCheckCircle />} label={t('dashboard.confirmedReservations')} value={confirmed} helper={t('reservations.statusConfirmed')} />
            <StatCard icon={<FiXCircle />} label={t('dashboard.cancelledReservations')} value={cancelled} helper={t('reservations.statusCancelled')} />
          </div>

          <div className="dashboard-grid">
            <article className="panel-card next-reservation-panel">
              <span className="panel-kicker">{t('dashboard.recentActivity')}</span>
              {nextReservation ? (
                <>
                  <div className="next-icon">{nextReservation.serviceType === 'hotel' ? <FiHome /> : <FiCoffee />}</div>
                  <h2>{nextReservation.serviceType === 'hotel' ? nextReservation.roomType : `Mesa ${nextReservation.tableArea}`}</h2>
                  <p>{nextReservation.date} · {nextReservation.time}</p>
                  <StatusBadge status={nextReservation.status} />
                  <Link className="text-link" to="/mis-reservas">{t('nav.myReservations')} →</Link>
                </>
              ) : (
                <div className="empty-mini">
                  <p>{t('dashboard.noRecentActivity')}</p>
                  <Link className="button primary" to="/reservar">{t('dashboard.newBooking')}</Link>
                </div>
              )}
            </article>

            <article className="panel-card experience-panel">
              <div>
                <span className="panel-kicker">{t('home.eyebrow')}</span>
                <h2>{t('home.servicesTitle')}</h2>
                <p>{t('home.heroDesc')}</p>
              </div>
              <div className="experience-buttons">
                <Link to="/reservar" className="experience-button"><FiHome /> {t('common.hotel')}</Link>
                <Link to="/reservar" className="experience-button"><FiCoffee /> {t('common.restaurant')}</Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

function AdminDashboard() {
  const { t } = useLanguage();
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const metrics = useMemo(() => {
    const by = (status) => reservations.filter((r) => r.status === status).length;
    return {
      total: reservations.length,
      pending: by('Pendiente'),
      confirmed: by('Confirmada'),
      cancelled: by('Cancelada'),
      hotel: reservations.filter((r) => r.serviceType === 'hotel').length,
      restaurant: reservations.filter((r) => r.serviceType === 'restaurant').length,
      users: users.filter((u) => u.role === 'user').length,
    };
  }, [reservations, users]);

  const statusData = [
    { name: t('dashboard.pendingReservations'), value: metrics.pending },
    { name: t('dashboard.confirmedReservations'), value: metrics.confirmed },
    { name: t('dashboard.cancelledReservations'), value: metrics.cancelled },
  ];
  const typeData = [
    { name: t('common.hotel'), value: metrics.hotel },
    { name: t('common.restaurant'), value: metrics.restaurant },
  ];

  if (loading) return <Loader text={t('common.loading')} />;

  return (
    <main className="dashboard-page admin-dashboard">
      <section className="dashboard-welcome admin-welcome">
        <div className="container welcome-inner">
          <div>
            <span className="eyebrow">{t('dashboard.adminTitle')}</span>
            <h1>{t('dashboard.adminTitle')}</h1>
            <p>{t('dashboard.adminSubtitle')}</p>
          </div>
          <div className="hero-actions">
            <Link className="button light" to="/admin/reservas">{t('dashboard.viewAllBookings')}</Link>
            <Link className="button light-outline" to="/admin/usuarios">{t('dashboard.manageUsers')}</Link>
          </div>
        </div>
      </section>

      <section className="section dashboard-content">
        <div className="container">
          <ErrorMessage message={error} />

          <div className="stats-grid admin-stats">
            <StatCard icon={<FiCalendar />} label={t('dashboard.totalReservations')} value={metrics.total} helper={t('common.all')} />
            <StatCard icon={<FiClock />} label={t('dashboard.pendingReservations')} value={metrics.pending} helper={t('reservations.statusPending')} />
            <StatCard icon={<FiCheckCircle />} label={t('dashboard.confirmedReservations')} value={metrics.confirmed} helper={t('reservations.statusConfirmed')} />
            <StatCard icon={<FiXCircle />} label={t('dashboard.cancelledReservations')} value={metrics.cancelled} helper={t('reservations.statusCancelled')} />
            <StatCard icon={<FiUsers />} label={t('dashboard.registeredUsers')} value={metrics.users} helper={t('users.totalUsers')} />
            <StatCard icon={<FiHome />} label={t('common.hotel')} value={metrics.hotel} helper={t('dashboard.hotelReservations')} />
            <StatCard icon={<FiCoffee />} label={t('common.restaurant')} value={metrics.restaurant} helper={t('dashboard.diningReservations')} />
          </div>

          <div className="charts-grid">
            <article className="panel-card chart-panel">
              <div className="panel-heading">
                <div><span className="panel-kicker">{t('dashboard.statusOverview')}</span><h2>{t('dashboard.statusOverview')}</h2></div>
              </div>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={100} paddingAngle={4}>
                      {statusData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                {statusData.map((item, i) => <span key={item.name}><i style={{ background: COLORS[i] }} />{item.name}: {item.value}</span>)}
              </div>
            </article>

            <article className="panel-card chart-panel">
              <div className="panel-heading"><div><span className="panel-kicker">{t('dashboard.distributionByType')}</span><h2>{t('dashboard.distributionByType')}</h2></div></div>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#b8914b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>

          <article className="panel-card recent-panel">
            <div className="panel-heading">
              <div><span className="panel-kicker">{t('dashboard.recentActivity')}</span><h2>{t('dashboard.recentActivity')}</h2></div>
              <Link className="text-link" to="/admin/reservas">{t('dashboard.viewAllBookings')} →</Link>
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>{t('users.colName')}</th><th>{t('reservations.serviceType')}</th><th>{t('reservations.date')}</th><th>{t('reservations.time')}</th><th>{t('dashboard.statusOverview')}</th></tr></thead>
                <tbody>
                  {reservations.slice(0, 6).map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.guestName}</strong><small>{r.email}</small></td>
                      <td>{r.serviceType === 'hotel' ? t('common.hotel') : t('common.restaurant')}</td>
                      <td>{r.date}</td>
                      <td>{r.time}</td>
                      <td><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
