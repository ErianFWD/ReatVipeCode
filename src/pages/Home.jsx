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

      <section className="section dark-section">
        <div className="container value-grid">
          <div>
            <FiShield />
            <h3>{t('home.feature1Title')}</h3>
            <p>{t('home.feature1Desc')}</p>
          </div>
          <div>
            <FiAward />
            <h3>{t('home.feature2Title')}</h3>
            <p>{t('home.feature2Desc')}</p>
          </div>
          <div>
            <FiHeart />
            <h3>{t('home.feature3Title')}</h3>
            <p>{t('home.feature3Desc')}</p>
          </div>
        </div>
      </section>

      <section className="section quote-section">
        <div className="container quote-card">
          <span>RESERVAPRO</span>
          <blockquote>{t('home.quote')}</blockquote>
          <Link className="button primary" to="/login">{t('nav.login')}</Link>
        </div>
      </section>
    </main>
  );
}
