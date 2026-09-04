import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiLock, FiMail } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const LOGIN_IMAGE = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=86';

export default function Login() {
  const { user, login } = useAuth();
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
      setError('Ingresa correo y contraseña.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@reservapro.com');
      setPassword('1234');
    } else {
      setEmail('user@reservapro.com');
      setPassword('1234');
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <img src={LOGIN_IMAGE} alt="Lobby de hotel boutique" onError={(e) => { e.currentTarget.src = '/fallback-hotel.svg'; }} />
        <div className="login-visual-shade" />
        <div className="login-visual-copy">
          <span className="eyebrow">RESERVAPRO</span>
          <h1>Tu experiencia comienza con una reserva.</h1>
          <p>Hotel boutique y restaurante, gestionados desde una única cuenta.</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <span className="eyebrow dark">BIENVENIDO</span>
          <h2>Inicia sesión</h2>
          <p className="muted">Accede a tus reservas o al panel administrativo.</p>

          <ErrorMessage message={error} />

          <form onSubmit={submit} className="login-form">
            <label className="field">
              <span>Correo</span>
              <div className="input-with-icon">
                <FiMail />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@reservapro.com" autoComplete="email" />
              </div>
            </label>
            <label className="field">
              <span>Contraseña</span>
              <div className="input-with-icon">
                <FiLock />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" autoComplete="current-password" />
              </div>
            </label>
            <button className="button primary large full-button" type="submit" disabled={submitting}>
              {submitting ? 'Validando...' : <>Iniciar sesión <FiArrowRight /></>}
            </button>
          </form>

          <div className="demo-accounts">
            <div>
              <span>ADMIN DEMO</span>
              <strong>admin@reservapro.com</strong>
              <small>Contraseña: 1234</small>
              <button onClick={() => fillDemo('admin')}>Usar cuenta</button>
            </div>
            <div>
              <span>USER DEMO</span>
              <strong>user@reservapro.com</strong>
              <small>Contraseña: 1234</small>
              <button onClick={() => fillDemo('user')}>Usar cuenta</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
