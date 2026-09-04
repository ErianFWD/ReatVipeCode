import { useEffect, useState } from 'react';
import { FiCalendar, FiMail, FiShield, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getUserReservations } from '../services/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
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
          <span className="eyebrow">{t('profile.memberSince')}</span>
          <h1>{t('profile.title')}</h1>
          <p>{t('profile.subtitle')}</p>
        </div>
      </section>
      <section className="section light-section">
        <div className="container profile-layout">
          <div className="profile-avatar">{user.name.charAt(0)}</div>
          <article className="profile-card">
            <ErrorMessage message={error} />
            <div><FiUser /><span><small>{t('users.colName')}</small><strong>{user.name}</strong></span></div>
            <div><FiMail /><span><small>{t('users.colEmail')}</small><strong>{user.email}</strong></span></div>
            <div><FiShield /><span><small>{t('profile.roleLabel')}</small><strong>{user.role === 'admin' ? t('nav.adminBadge') : t('nav.clientBadge')}</strong></span></div>
            <div><FiCalendar /><span><small>{t('dashboard.totalReservations')}</small><strong>{count}</strong></span></div>
          </article>
        </div>
      </section>
    </main>
  );
}
