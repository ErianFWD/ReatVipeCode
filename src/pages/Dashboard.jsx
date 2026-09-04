import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FiCalendar, FiCheckCircle, FiClock, FiCoffee, FiHome, FiUsers, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
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

  if (loading) return <Loader text="Cargando tu dashboard..." />;

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome user-welcome">
        <div className="container welcome-inner">
          <div>
            <span className="eyebrow">ÁREA DE CLIENTE</span>
            <h1>Hola, {user.name.split(' ')[0]}.</h1>
            <p>Revisa tus próximas experiencias o crea una nueva reserva.</p>
          </div>
          <Link className="button light large" to="/reservar">Nueva reserva</Link>
        </div>
      </section>

      <section className="section dashboard-content">
        <div className="container">
          <ErrorMessage message={error} />
          <div className="stats-grid four">
            <StatCard icon={<FiCalendar />} label="Mis reservas" value={reservations.length} helper="Total registradas" />
            <StatCard icon={<FiClock />} label="Pendientes" value={pending} helper="Por confirmar" />
            <StatCard icon={<FiCheckCircle />} label="Confirmadas" value={confirmed} helper="Listas para disfrutar" />
            <StatCard icon={<FiXCircle />} label="Canceladas" value={cancelled} helper="Histórico" />
          </div>

          <div className="dashboard-grid">
            <article className="panel-card next-reservation-panel">
              <span className="panel-kicker">PRÓXIMA RESERVA</span>
              {nextReservation ? (
                <>
                  <div className="next-icon">{nextReservation.serviceType === 'hotel' ? <FiHome /> : <FiCoffee />}</div>
                  <h2>{nextReservation.serviceType === 'hotel' ? nextReservation.roomType : `Mesa ${nextReservation.tableArea}`}</h2>
                  <p>{nextReservation.date} · {nextReservation.time}</p>
                  <StatusBadge status={nextReservation.status} />
                  <Link className="text-link" to="/mis-reservas">Ver mis reservas →</Link>
                </>
              ) : (
                <div className="empty-mini">
                  <p>No tienes próximas reservas activas.</p>
                  <Link className="button primary" to="/reservar">Crear reserva</Link>
                </div>
              )}
            </article>

            <article className="panel-card experience-panel">
              <div>
                <span className="panel-kicker">TU EXPERIENCIA</span>
                <h2>Hotel o restaurante, tú eliges.</h2>
                <p>Reserva una estadía o una mesa sin salir de tu cuenta.</p>
              </div>
              <div className="experience-buttons">
                <Link to="/reservar" className="experience-button"><FiHome /> Hotel</Link>
                <Link to="/reservar" className="experience-button"><FiCoffee /> Restaurante</Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

function AdminDashboard() {
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
    { name: 'Pendientes', value: metrics.pending },
    { name: 'Confirmadas', value: metrics.confirmed },
    { name: 'Canceladas', value: metrics.cancelled },
  ];
  const typeData = [
    { name: 'Hotel', value: metrics.hotel },
    { name: 'Restaurante', value: metrics.restaurant },
  ];

  if (loading) return <Loader text="Cargando panel administrativo..." />;

  return (
    <main className="dashboard-page admin-dashboard">
      <section className="dashboard-welcome admin-welcome">
        <div className="container welcome-inner">
          <div>
            <span className="eyebrow">PANEL ADMINISTRATIVO</span>
            <h1>Vista general del negocio.</h1>
            <p>Reservas, usuarios y operación diaria desde una sola pantalla.</p>
          </div>
          <div className="hero-actions">
            <Link className="button light" to="/admin/reservas">Gestionar reservas</Link>
            <Link className="button light-outline" to="/admin/usuarios">Gestionar usuarios</Link>
          </div>
        </div>
      </section>

      <section className="section dashboard-content">
        <div className="container">
          <ErrorMessage message={error} />

          <div className="stats-grid admin-stats">
            <StatCard icon={<FiCalendar />} label="Reservas" value={metrics.total} helper="Total" />
            <StatCard icon={<FiClock />} label="Pendientes" value={metrics.pending} helper="Requieren acción" />
            <StatCard icon={<FiCheckCircle />} label="Confirmadas" value={metrics.confirmed} helper="Aprobadas" />
            <StatCard icon={<FiXCircle />} label="Canceladas" value={metrics.cancelled} helper="Histórico" />
            <StatCard icon={<FiUsers />} label="Clientes" value={metrics.users} helper="Usuarios estándar" />
            <StatCard icon={<FiHome />} label="Hotel" value={metrics.hotel} helper="Reservas hotel" />
            <StatCard icon={<FiCoffee />} label="Restaurante" value={metrics.restaurant} helper="Reservas restaurante" />
          </div>

          <div className="charts-grid">
            <article className="panel-card chart-panel">
              <div className="panel-heading">
                <div><span className="panel-kicker">ESTADOS</span><h2>Reservas por estado</h2></div>
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
              <div className="panel-heading"><div><span className="panel-kicker">SERVICIOS</span><h2>Hotel vs. restaurante</h2></div></div>
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
              <div><span className="panel-kicker">ACTIVIDAD</span><h2>Reservas recientes</h2></div>
              <Link className="text-link" to="/admin/reservas">Ver todas →</Link>
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Hora</th><th>Estado</th></tr></thead>
                <tbody>
                  {reservations.slice(0, 6).map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.guestName}</strong><small>{r.email}</small></td>
                      <td>{r.serviceType === 'hotel' ? 'Hotel' : 'Restaurante'}</td>
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
