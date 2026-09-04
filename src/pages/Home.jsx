import { Link } from 'react-router-dom';
import { FiArrowRight, FiAward, FiCalendar, FiCheckCircle, FiClock, FiHeart, FiHome, FiShield, FiStar } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext.jsx';

const HOTEL_IMAGE = 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1800&q=85';
const RESTAURANT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=85';
const HERO_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2200&q=88';

export default function Home() {
  const { t } = useLanguage();

  return (
    <main>
      <section className="public-hero">
        <img src={HERO_IMAGE} alt="Hotel boutique" onError={(e) => { e.currentTarget.src = '/fallback-hotel.svg'; }} />
        <div className="public-hero-shade" />
        <div className="container public-hero-content">
          <span className="eyebrow">{t('home.eyebrow')}</span>
          <h1>{t('home.heroTitle')}</h1>
          <p>{t('home.heroDesc')}</p>
          <div className="hero-actions">
            <Link className="button primary large" to="/login">
              {t('home.reserveHotel')} <FiArrowRight />
            </Link>
            <a className="button light-outline large" href="#servicios">
              {t('home.reserveDining')}
            </a>
          </div>
        </div>
      </section>

      <section className="section light-section" id="servicios">
        <div className="container">
          <div className="section-heading centered">
            <span className="eyebrow dark">{t('home.eyebrow')}</span>
            <h2>{t('home.servicesTitle')}</h2>
          </div>

          <div className="service-grid">
            <article className="service-card">
              <div className="service-image">
                <img src={HOTEL_IMAGE} alt="Hotel Suite" onError={(e) => { e.currentTarget.src = '/fallback-hotel.svg'; }} />
                <span>{t('home.hotelTitle')}</span>
              </div>
              <div className="service-copy">
                <FiHome />
                <h3>{t('home.hotelTitle')}</h3>
                <p>{t('home.hotelDesc')}</p>
                <Link to="/login" className="text-link">{t('home.reserveHotel')} <FiArrowRight /></Link>
              </div>
            </article>

            <article className="service-card">
              <div className="service-image">
                <img src={RESTAURANT_IMAGE} alt="Restaurant Table" onError={(e) => { e.currentTarget.src = '/fallback-restaurant.svg'; }} />
                <span>{t('home.restaurantTitle')}</span>
              </div>
              <div className="service-copy">
                <FiStar />
                <h3>{t('home.restaurantTitle')}</h3>
                <p>{t('home.restaurantDesc')}</p>
                <Link to="/login" className="text-link">{t('home.reserveDining')} <FiArrowRight /></Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section dark-section location-section">
        <div className="container">
          <div className="location-header">
            <div className="location-header-text">
              <span className="location-eyebrow">📍 Nuestra ubicación</span>
              <h2 className="location-title">Encuéntranos en La Fortuna,<br />Costa Rica</h2>
              <p className="location-sub">A pasos del Volcán Arenal · Alajuela, Costa Rica</p>
            </div>
            <a
              href="https://maps.google.com/?q=Arenal+Kioro+Suites+%26+Spa,+La+Fortuna,+Costa+Rica"
              target="_blank"
              rel="noopener noreferrer"
              className="button primary location-btn"
            >
              Abrir en Google Maps ↗
            </a>
          </div>
          <div className="location-map-wrap">
            <iframe
              title="Arenal Kioro Suites – La Fortuna, Costa Rica"
              src="https://maps.google.com/maps?q=Arenal+Kioro+Suites+%26+Spa+La+Fortuna+Costa+Rica&t=&z=14&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="460"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="section quote-section">
        <div className="container quote-card">
          <span>ARENAL KIORO SUITES</span>
          <blockquote>{t('home.quote')}</blockquote>
          <div className="quote-actions">
            <Link className="button primary" to="/reservar">
              Reservar habitación
            </Link>
            <Link className="button secondary" to="/reservar">
              Reservar en restaurante
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
