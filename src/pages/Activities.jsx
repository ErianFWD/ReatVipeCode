import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import { FiCalendar, FiCheckCircle, FiClock, FiFilter, FiInfo, FiSearch, FiTag, FiUser, FiUsers } from 'react-icons/fi';
import { activitiesData } from '../data/activitiesData.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Activities() {
  const { lang, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: { es: 'Todas las Experiencias', en: 'All Experiences', fr: 'Toutes les Expériences', zh: '全部体验项目' } },
    { id: 'hotel-activity', label: { es: 'Actividades del Hotel', en: 'Hotel Activities', fr: 'Activités de l’Hôtel', zh: '酒店专属活动' } },
    { id: 'crafts-course', label: { es: 'Cursos de Manualidades', en: 'Crafts & Workshops', fr: 'Cours d’Artisanat', zh: '手作工坊课程' } },
  ];

  const filteredItems = useMemo(() => {
    return activitiesData.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const trans = item.translations[lang] || item.translations.es;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        trans.title.toLowerCase().includes(q) ||
        trans.desc.toLowerCase().includes(q) ||
        item.inChargeName.toLowerCase().includes(q) ||
        item.inChargeRole.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery, lang]);

  return (
    <main className="activities-page">
      {/* Hero Section */}
      <section className="activities-hero">
        <div className="container activities-hero-content">
          <span className="eyebrow">{t('activities.eyebrow', 'EXPERIENCIAS & CURSOS')}</span>
          <h1>{t('activities.title', 'Actividades & Cursos del Hotel')}</h1>
          <p>{t('activities.subtitle', 'Enriquece tu estancia con deportes recreativos, sesiones de spa de bienestar y cursos exclusivos de manualidades dirigidos por expertos.')}</p>
          <div className="activities-hero-notes">
            <span><FiTag /> {t('activities.costNote', 'Costo adicional a la tarifa de la habitación')}</span>
            <span><FiUsers /> {t('activities.quotaNote', 'Cupos limitados por sesión')}</span>
            <span><FaWhatsapp /> {t('activities.whatsappNote', 'Contacto directo con el instructor encargado')}</span>
          </div>
        </div>
      </section>

      {/* Filter & Search Toolbar */}
      <section className="activities-filter-section">
        <div className="container">
          <div className="activities-toolbar">
            <div className="activities-category-tabs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <FiFilter /> {cat.label[lang] || cat.label.es}
                </button>
              ))}
            </div>

            <div className="activities-search-box">
              <FiSearch />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('activities.searchPlaceholder', 'Buscar por actividad, curso o instructor...')}
              />
              {searchQuery && (
                <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Activities & Courses Cards Grid */}
      <section className="section activities-grid-section">
        <div className="container">
          <div className="activities-count-badge">
            <strong>{filteredItems.length}</strong> {t('activities.itemsFound', 'experiencias disponibles con cupo')}
          </div>

          <div className="activities-grid">
            {filteredItems.map((item) => {
              const trans = item.translations[lang] || item.translations.es;
              const percentOccupied = Math.round(((item.totalSlots - item.availableSlots) / item.totalSlots) * 100);
              const isFewSlots = item.availableSlots <= 3;

              return (
                <article key={item.id} className="activity-card">
                  {/* Card Media Header */}
                  <div className="activity-card-media">
                    <img
                      src={item.image}
                      alt={trans.title}
                      loading="lazy"
                      onError={(e) => {
                        if (item.fallbackImage && e.currentTarget.src !== item.fallbackImage) {
                          e.currentTarget.src = item.fallbackImage;
                        }
                      }}
                    />
                    <div className="activity-card-badge">{trans.badge}</div>
                    <div className="activity-price-tag">
                      <span className="price-amount">${item.price} USD</span>
                      <small className="price-label">/{t('activities.perPerson', 'persona')}</small>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="activity-card-body">
                    <div className="activity-category-pill">{trans.categoryName}</div>
                    <h3 className="activity-title">{trans.title}</h3>
                    <p className="activity-description">{trans.desc}</p>

                    {/* Schedule & Duration Info */}
                    <div className="activity-meta-row">
                      <span><FiClock /> <strong>{t('activities.duration', 'Duración')}:</strong> {item.duration}</span>
                      <span><FiCalendar /> <strong>{t('activities.schedule', 'Horario')}:</strong> {item.schedule}</span>
                    </div>

                    {/* Quota / Cupos Section */}
                    <div className="activity-quota-box">
                      <div className="quota-header">
                        <span className="quota-title">
                          <FiUsers /> {t('activities.slots', 'Cupos')}:
                        </span>
                        <span className={`quota-status ${isFewSlots ? 'alert' : 'available'}`}>
                          {item.availableSlots} {t('activities.slotsLeft', 'disponibles')} ({item.totalSlots} {t('activities.slotsTotal', 'totales')})
                        </span>
                      </div>
                      <div className="quota-progress-bar">
                        <div
                          className={`quota-progress-fill ${isFewSlots ? 'few' : ''}`}
                          style={{ width: `${percentOccupied}%` }}
                        />
                      </div>
                    </div>

                    {/* Person In Charge (Instructor / Encargado) */}
                    <div className="activity-instructor-card">
                      <div className="instructor-avatar">
                        <FiUser />
                      </div>
                      <div className="instructor-details">
                        <small className="instructor-label">{t('activities.inChargeLabel', 'Persona encargada')}</small>
                        <strong className="instructor-name">{item.inChargeName}</strong>
                        <span className="instructor-role">{item.inChargeRole}</span>
                      </div>
                    </div>

                    {/* Direct Contact & WhatsApp Actions */}
                    <div className="activity-actions">
                      <a
                        href={item.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button-activity-whatsapp"
                        title="Contactar por WhatsApp al encargado"
                      >
                        <FaWhatsapp className="btn-icon" />
                        <div className="btn-text-block">
                          <span>{t('activities.contactWhatsApp', 'Reservar con encargado')}</span>
                          <small>{item.contactNumber}</small>
                        </div>
                      </a>

                      <a
                        href={`tel:${item.contactNumber.replace(/[^0-9+]/g, '')}`}
                        className="button-activity-phone"
                        title="Llamar directamente"
                      >
                        <FaPhoneAlt />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="empty-state">
              <FiInfo />
              <h2>{t('activities.noResultsTitle', 'No se encontraron actividades')}</h2>
              <p>{t('activities.noResultsDesc', 'Intenta con otro término de búsqueda o selecciona otra categoría.')}</p>
              <button
                type="button"
                className="button primary"
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              >
                {t('activities.viewAllBtn', 'Ver todas las experiencias')}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Hotel Guests Callout Banner */}
      <section className="section activities-callout-section">
        <div className="container activities-callout-card">
          <div className="callout-content">
            <span className="eyebrow">{t('activities.exclusiveGuests', 'BENEFICIO EXCLUSIVO')}</span>
            <h2>{t('activities.calloutTitle', '¿Hospedado en ReservaPro?')}</h2>
            <p>{t('activities.calloutDesc', 'Todos los cargos de actividades y cursos de manualidades pueden ser cargados directamente al folio de tu habitación para mayor comodidad.')}</p>
          </div>
          <div className="callout-actions">
            <Link to="/reservar" className="button primary large">
              <FiCheckCircle /> {t('home.reserveHotel', 'Reservar Habitación')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
