import { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiTrash2, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { createUser, deleteUser, getReservations, getUsers } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const emptyForm = { name: '', email: '', password: '', role: 'user' };

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getUsers(), getReservations()])
      .then(([userData, reservationData]) => {
        if (!active) return;
        setUsers(userData);
        setReservations(reservationData);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const reservationCount = useMemo(() => {
    const counts = {};
    reservations.forEach((reservation) => { counts[reservation.ownerId] = (counts[reservation.ownerId] || 0) + 1; });
    return counts;
  }, [reservations]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Completa todos los campos del nuevo usuario.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Ingresa un correo válido.');
      return;
    }
    if (users.some((user) => user.email.toLowerCase() === form.email.trim().toLowerCase())) {
      setError('Ese correo ya está registrado.');
      return;
    }

    setSaving(true);
    try {
      const created = await createUser({ ...form, name: form.name.trim(), email: form.email.trim() });
      setUsers((current) => [...current, created]);
      setForm(emptyForm);
      setMessage('Usuario creado correctamente.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (user) => {
    if (user.id === currentUser.id) {
      setError('No puedes eliminar el administrador que tiene la sesión iniciada.');
      return;
    }
    if (reservationCount[user.id]) {
      setError(`No se puede eliminar a ${user.name} porque tiene ${reservationCount[user.id]} reserva(s) asociada(s).`);
      return;
    }
    if (!window.confirm(`¿Eliminar a ${user.name}?`)) return;
    try {
      await deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      setMessage('Usuario eliminado correctamente.');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader text="Cargando usuarios..." />;

  return (
    <main className="inner-page admin-page">
      <section className="page-hero compact-hero admin-subhero">
        <div className="container">
          <span className="eyebrow"><FiUsers /> ADMINISTRACIÓN</span>
          <h1>Gestión de usuarios.</h1>
          <p>Crea clientes o administradores y consulta su actividad sin exponer contraseñas.</p>
        </div>
      </section>

      <section className="section dashboard-content">
        <div className="container users-layout">
          <aside className="panel-card create-user-panel">
            <span className="panel-kicker">NUEVO USUARIO</span>
            <h2>Crear cuenta</h2>
            {message && <div className="message success-message">{message}</div>}
            <ErrorMessage message={error} />
            <form className="simple-form" onSubmit={submit}>
              <label className="field"><span>Nombre</span><input name="name" value={form.name} onChange={update} /></label>
              <label className="field"><span>Correo</span><input type="email" name="email" value={form.email} onChange={update} /></label>
              <label className="field"><span>Contraseña</span><input type="password" name="password" value={form.password} onChange={update} /></label>
              <label className="field"><span>Rol</span><select name="role" value={form.role} onChange={update}><option value="user">user</option><option value="admin">admin</option></select></label>
              <button className="button primary full-button" disabled={saving}><FiPlus /> {saving ? 'Guardando...' : 'Crear usuario'}</button>
            </form>
          </aside>

          <section className="panel-card users-table-panel">
            <div className="panel-heading"><div><span className="panel-kicker">DIRECTORIO</span><h2>Usuarios registrados</h2></div><strong>{users.length}</strong></div>
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Reservas</th><th>Acción</th></tr></thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td><span className={`role-pill role-${user.role}`}>{user.role}</span></td>
                      <td>{reservationCount[user.id] || 0}</td>
                      <td><button className="action-icon danger" title="Eliminar" onClick={() => remove(user)} disabled={user.id === currentUser.id}><FiTrash2 /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
