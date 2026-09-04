import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar, FiCheckCircle, FiClock, FiHome, FiStar } from 'react-icons/fi';

const HOTEL_IMAGE = 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1800&q=85';
const RESTAURANT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=85';
const HERO_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2200&q=88';

export default function Home() {
  return (
    <main>
      <section className="public-hero">
        <img src={HERO_IMAGE} alt="Hotel boutique" onError={(e) => { e.currentTarget.src = '/fallback-hotel.svg'; }} />
        <div className="public-hero-shade" />
        <div className="container public-hero-content">
          <span className="eyebrow">HOTEL BOUTIQUE & RESTAURANT</span>
          <h1>Reserva momentos que importan.</h1>
          <p>
            Un solo lugar para organizar estadías, cenas y experiencias memorables con una gestión simple y elegante.
          </p>
          <div className="hero-actions">
            <Link className="button primary large" to="/login">Comenzar ahora <FiArrowRight /></Link>
            <a className="button light-outline large" href="#servicios">Ver servicios</a>
          </div>
        </div>
      </section>

      <section className="section light-section" id="servicios">
        <div className="container">
          <div className="section-heading centered">
            <span className="eyebrow dark">DOS EXPERIENCIAS, UNA RESERVA</span>
            <h2>Elige cómo quieres vivir ReservaPro.</h2>
            <p>La misma cuenta te permite reservar alojamiento o una mesa en el restaurante.</p>
          </div>

          <div className="service-grid">
            <article className="service-card">
              <div className="service-image">
                <img src={HOTEL_IMAGE} alt="Habitación de hotel boutique" onError={(e) => { e.currentTarget.src = '/fallback-hotel.svg'; }} />
                <span>Hotel Boutique</span>
              </div>
              <div className="service-copy">
                <FiHome />
                <h3>Descansa con intención.</h3>
                <p>Habitaciones estándar, premium y suites para estadías tranquilas y personalizadas.</p>
                <Link to="/login">Reservar estancia <FiArrowRight /></Link>
              </div>
            </article>

            <article className="service-card">
              <div className="service-image">
                <img src={RESTAURANT_IMAGE} alt="Restaurante elegante" onError={(e) => { e.currentTarget.src = '/fallback-restaurant.svg'; }} />
                <span>Restaurante</span>
              </div>
              <div className="service-copy">
                <FiStar />
                <h3>Una mesa para cada ocasión.</h3>
                <p>Reserva en interior, terraza o zona VIP con control de fecha, hora y número de personas.</p>
                <Link to="/login">Reservar mesa <FiArrowRight /></Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section dark-section">
        <div className="container value-grid">
          <div>
            <FiCalendar />
            <h3>Reservas simples</h3>
            <p>Crea una solicitud en pocos pasos y consulta su estado desde tu cuenta.</p>
          </div>
          <div>
            <FiCheckCircle />
            <h3>Gestión centralizada</h3>
            <p>El equipo administrador confirma, cancela y organiza todas las reservas desde un solo panel.</p>
          </div>
          <div>
            <FiClock />
            <h3>Seguimiento inmediato</h3>
            <p>Estados claros para saber si una reserva está pendiente, confirmada o cancelada.</p>
          </div>
        </div>
      </section>

      <section className="section quote-section">
        <div className="container quote-card">
          <span>RESERVAPRO</span>
          <blockquote>“Una experiencia premium empieza antes de llegar.”</blockquote>
          <Link className="button primary" to="/login">Ingresar al sistema</Link>
        </div>
      </section>
    </main>
  );
}
