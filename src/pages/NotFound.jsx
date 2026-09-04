import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="center-page">
      <div className="center-card">
        <span>404</span>
        <h1>Página no encontrada.</h1>
        <p>La ruta solicitada no existe en ReservaPro.</p>
        <Link className="button primary" to="/">Volver al inicio</Link>
      </div>
    </main>
  );
}
