import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiLock, FiMail } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const LOGIN_IMAGE = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=86';

export default function Login() {
  const { user, login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => setError(''), [email, password]);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError(t('login.errorInvalid'));
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.ok) {
        setError(result.message || t('login.errorInvalid'));
        return;
      }
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || t('login.errorInvalid'));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@arenalkioro.com');
      setPassword('1234');
    } else {
      setEmail('user@arenalkioro.com');
      setPassword('1234');
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <img src={LOGIN_IMAGE} alt="Lobby de hotel boutique" onError={(e) => { e.currentTarget.src = '/fallback-hotel.svg'; }} />
        <div className="login-visual-shade" />
        <div className="login-visual-copy">
          <span className="eyebrow">ARENAL KIORO SUITES</span>
          <h1>{t('home.heroTitle')}</h1>
          <p>{t('home.heroDesc')}</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <span className="eyebrow dark">ARENAL KIORO SUITES</span>
          <h2>{t('login.title')}</h2>
          <p className="muted">{t('login.subtitle')}</p>

          <ErrorMessage message={error} />

          <form onSubmit={submit} className="login-form">
            <label className="field">
              <span>{t('login.email')}</span>
              <div className="input-with-icon">
                <FiMail />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('login.emailPlaceholder')} autoComplete="email" />
              </div>
            </label>
            <label className="field">
              <span>{t('login.password')}</span>
              <div className="input-with-icon">
                <FiLock />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('login.passwordPlaceholder')} autoComplete="current-password" />
              </div>
            </label>
            <button className="button primary large full-button" type="submit" disabled={submitting}>
              {submitting ? t('login.loadingBtn') : <>{t('login.submitBtn')} <FiArrowRight /></>}
            </button>
          </form>

          <div className="demo-accounts">
            <div>
              <span>{t('login.demoAdmin')}</span>
              <strong>admin@arenalkioro.com</strong>
              <small>PIN: 1234</small>
              <button type="button" onClick={() => fillDemo('admin')}>{t('login.demoFill')}</button>
            </div>
            <div>
              <span>{t('login.demoClient')}</span>
              <strong>user@arenalkioro.com</strong>
              <small>PIN: 1234</small>
              <button type="button" onClick={() => fillDemo('user')}>{t('login.demoFill')}</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
