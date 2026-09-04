import { useEffect, useState } from 'react';
import { FiCalendar, FiMail, FiShield, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { getUserReservations } from '../services/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Profile() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    getUserReservations(user.id)
      .then((data) => setCount(data.length))
      .catch((err) => setError(err.message));
  }, [user.id]);

  return (
    <main className="inner-page profile-page">
      <section className="page-hero compact-hero">
        <div className="container">
          <span className="eyebrow">MI CUENTA</span>
          <h1>Perfil.</h1>
          <p>Información básica de la sesión activa.</p>
        </div>
      </section>
      <section className="section light-section">
        <div className="container profile-layout">
          <div className="profile-avatar">{user.name.charAt(0)}</div>
          <article className="profile-card">
            <ErrorMessage message={error} />
            <div><FiUser /><span><small>Nombre</small><strong>{user.name}</strong></span></div>
            <div><FiMail /><span><small>Correo</small><strong>{user.email}</strong></span></div>
            <div><FiShield /><span><small>Rol</small><strong>{user.role}</strong></span></div>
            <div><FiCalendar /><span><small>Reservas registradas</small><strong>{count}</strong></span></div>
          </article>
        </div>
      </section>
    </main>
  );
}
