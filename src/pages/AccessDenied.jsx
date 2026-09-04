import { Link } from 'react-router-dom';
import { FiShield } from 'react-icons/fi';

export default function AccessDenied() {
  return (
    <main className="center-page">
      <div className="center-card">
        <FiShield />
        <span>403</span>
        <h1>Acceso denegado.</h1>
        <p>No tienes permisos para acceder a esta sección.</p>
        <Link className="button primary" to="/dashboard">Volver al dashboard</Link>
      </div>
    </main>
  );
}
