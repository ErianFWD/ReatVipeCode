import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container footer-content">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <div className="footer-brand-header">
            <span className="brand-mark">R</span>
            <div>
              <strong className="footer-brand-title">{t('footer.brand')}</strong>
              <span className="footer-brand-subtitle">{t('footer.subtitle')}</span>
            </div>
          </div>
          <p className="footer-tagline">{t('footer.tagline')}</p>
        </div>

        {/* Contact & Concierge Column */}
        <div className="footer-contact-col">
          <h4>{t('footer.contactTitle')}</h4>
          <ul className="footer-contact-list">
            <li>
              <a href="https://wa.me/50688888888?text=Hola,%20deseo%20información%20sobre%20reservas%20en%20ReservaPro" target="_blank" rel="noopener noreferrer" className="footer-contact-link whatsapp-highlight">
                <FaWhatsapp className="contact-icon whatsapp-icon" />
                <span><strong>{t('footer.whatsappText')}:</strong> +506 8888-8888</span>
              </a>
            </li>
            <li>
              <a href="tel:+50688888888" className="footer-contact-link">
                <FiPhone className="contact-icon" />
                <span>+506 8888-8888</span>
              </a>
            </li>
            <li>
              <a href="mailto:reservas@reservapro.com" className="footer-contact-link">
                <FiMail className="contact-icon" />
                <span>{t('footer.email')}</span>
              </a>
            </li>
            <li>
              <span className="footer-contact-item">
                <FiMapPin className="contact-icon" />
                <span>{t('footer.address')}</span>
              </span>
            </li>
          </ul>
        </div>

        {/* Social Media Column */}
        <div className="footer-social-col">
          <h4>{t('footer.socialTitle')}</h4>
          <div className="footer-social-grid">
            <a
              href="https://instagram.com/reservapro.boutique"
              target="_blank"
              rel="noopener noreferrer"
              className="social-card social-instagram"
              title="Instagram @reservapro.boutique"
            >
              <div className="social-card-icon">
                <FaInstagram />
              </div>
              <div className="social-card-text">
                <span className="social-platform">Instagram</span>
                <span className="social-handle">@reservapro.boutique</span>
              </div>
            </a>

            <a
              href="https://facebook.com/reservapro.luxury"
              target="_blank"
              rel="noopener noreferrer"
              className="social-card social-facebook"
              title="Facebook ReservaPro Luxury"
            >
              <div className="social-card-icon">
                <FaFacebook />
              </div>
              <div className="social-card-text">
                <span className="social-platform">Facebook</span>
                <span className="social-handle">ReservaPro Luxury</span>
              </div>
            </a>

            <a
              href="https://wa.me/50688888888?text=Hola,%20deseo%20información%20sobre%20reservas%20en%20ReservaPro"
              target="_blank"
              rel="noopener noreferrer"
              className="social-card social-whatsapp"
              title="WhatsApp Concierge"
            >
              <div className="social-card-icon">
                <FaWhatsapp />
              </div>
              <div className="social-card-text">
                <span className="social-platform">WhatsApp</span>
                <span className="social-handle">+506 8888-8888</span>
              </div>
            </a>

            <a
              href="https://tiktok.com/@reservapro.experience"
              target="_blank"
              rel="noopener noreferrer"
              className="social-card social-tiktok"
              title="TikTok @reservapro.experience"
            >
              <div className="social-card-icon">
                <FaTiktok />
              </div>
              <div className="social-card-text">
                <span className="social-platform">TikTok</span>
                <span className="social-handle">@reservapro.experience</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
