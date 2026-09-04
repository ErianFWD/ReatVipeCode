import { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiTrash2, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { createUser, deleteUser, getReservations, getUsers } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const emptyForm = { name: '', email: '', password: '', role: 'user' };

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
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
      setError(t('login.errorInvalid'));
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError(t('login.errorInvalid'));
      return;
    }
    if (users.some((user) => user.email.toLowerCase() === form.email.trim().toLowerCase())) {
      setError(t('login.errorInvalid'));
      return;
    }

    setSaving(true);
    try {
      const created = await createUser({ ...form, name: form.name.trim(), email: form.email.trim() });
      setUsers((current) => [...current, created]);
      setForm(emptyForm);
      setMessage(t('users.userCreated'));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (user) => {
    if (user.id === currentUser.id) {
      setError(t('common.error'));
      return;
    }
    if (reservationCount[user.id]) {
      setError(`No se puede eliminar: ${reservationCount[user.id]} reservas.`);
      return;
    }
    if (!window.confirm(t('users.deleteUserPrompt'))) return;
    try {
      await deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      setMessage(t('users.userDeleted'));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader text={t('common.loading')} />;

  return (
    <main className="inner-page admin-page">
      <section className="page-hero compact-hero admin-subhero">
        <div className="container">
          <span className="eyebrow"><FiUsers /> {t('nav.adminBadge')}</span>
          <h1>{t('users.title')}</h1>
          <p>{t('users.subtitle')}</p>
        </div>
      </section>

      <section className="section dashboard-content">
        <div className="container users-layout">
          <aside className="panel-card create-user-panel">
            <span className="panel-kicker">{t('users.createUserTitle')}</span>
            <h2>{t('users.createUserTitle')}</h2>
            {message && <div className="message success-message">{message}</div>}
            <ErrorMessage message={error} />
            <form className="simple-form" onSubmit={submit}>
              <label className="field"><span>{t('users.name')}</span><input name="name" value={form.name} onChange={update} /></label>
              <label className="field"><span>{t('users.email')}</span><input type="email" name="email" value={form.email} onChange={update} /></label>
              <label className="field"><span>{t('users.password')}</span><input type="password" name="password" value={form.password} onChange={update} /></label>
              <label className="field"><span>{t('users.role')}</span><select name="role" value={form.role} onChange={update}><option value="user">{t('users.roleUser')}</option><option value="admin">{t('users.roleAdmin')}</option></select></label>
              <button className="button primary full-button" disabled={saving}><FiPlus /> {saving ? t('common.loading') : t('users.submitCreate')}</button>
            </form>
          </aside>

          <section className="panel-card users-table-panel">
            <div className="panel-heading"><div><span className="panel-kicker">DIRECTORIO</span><h2>{t('users.totalUsers')}</h2></div><strong>{users.length}</strong></div>
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>ID</th><th>{t('users.colName')}</th><th>{t('users.colEmail')}</th><th>{t('users.colRole')}</th><th>{t('dashboard.totalReservations')}</th><th>{t('users.colActions')}</th></tr></thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td><span className={`role-pill role-${user.role}`}>{user.role === 'admin' ? t('nav.adminBadge') : t('nav.clientBadge')}</span></td>
                      <td>{reservationCount[user.id] || 0}</td>
                      <td><button className="action-icon danger" title={t('reservations.deleteAction')} onClick={() => remove(user)} disabled={user.id === currentUser.id}><FiTrash2 /></button></td>
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
