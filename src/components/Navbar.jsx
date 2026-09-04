import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiActivity, FiCalendar, FiCompass, FiGrid, FiLogOut, FiMenu, FiUser, FiUsers, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import ConfirmModal from './ConfirmModal.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);
  const signOut = () => setShowLogoutModal(true);
  const confirmSignOut = () => {
    logout();
    setShowLogoutModal(false);
    close();
    navigate('/login');
  };

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <>
      <header className="navbar-shell">
        <div className="container navbar">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">R</span>
          <span>
            <strong>ReservaPro</strong>
            <small>{t('nav.brandSubtitle')}</small>
          </span>
        </Link>

        <div className="navbar-actions-mobile">
          <LanguageSelector />
          <button className="menu-toggle" onClick={() => setOpen((v) => !v)} aria-label="Abrir menú">
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className={`nav-links${open ? ' open' : ''}`}>
          {!user ? (
            <>
              <NavLink to="/" className={linkClass} onClick={close}>
                <FiCompass /> {t('nav.home')}
              </NavLink>
              <NavLink to="/actividades" className={linkClass} onClick={close}>
                <FiActivity /> {t('nav.activities')}
              </NavLink>
              <div className="nav-desktop-lang">
                <LanguageSelector />
              </div>
              <Link to="/login" className="button primary nav-cta" onClick={close}>
                <FiUser /> {t('nav.login')}
              </Link>
            </>
          ) : user.role === 'admin' ? (
            <>
              <NavLink to="/dashboard" className={linkClass} onClick={close}>
                <FiGrid /> {t('nav.dashboard')}
              </NavLink>
              <NavLink to="/actividades" className={linkClass} onClick={close}>
                <FiActivity /> {t('nav.activities')}
              </NavLink>
              <NavLink to="/admin/reservas" className={linkClass} onClick={close}>
                <FiCalendar /> {t('nav.reservations')}
              </NavLink>
              <NavLink to="/admin/usuarios" className={linkClass} onClick={close}>
                <FiUsers /> {t('nav.users')}
              </NavLink>

              <div className="nav-desktop-lang">
                <LanguageSelector />
              </div>

              <div className="nav-user-capsule">
                <div className="nav-user-avatar">
                  <FiUser />
                </div>
                <div className="nav-user-info">
                  <span className="nav-user-name">{user.name}</span>
                  <span className="nav-user-role admin">{t('nav.adminBadge')}</span>
                </div>
              </div>

              <button className="nav-logout-btn" onClick={signOut} title={t('nav.logout')}>
                <FiLogOut /> <span>{t('nav.logout')}</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className={linkClass} onClick={close}>
                <FiGrid /> {t('nav.dashboard')}
              </NavLink>
              <NavLink to="/reservar" className={linkClass} onClick={close}>
                <FiCalendar /> {t('nav.reserve')}
              </NavLink>
              <NavLink to="/actividades" className={linkClass} onClick={close}>
                <FiActivity /> {t('nav.activities')}
              </NavLink>
              <NavLink to="/mis-reservas" className={linkClass} onClick={close}>
                <FiCompass /> {t('nav.myReservations')}
              </NavLink>
              <NavLink to="/perfil" className={linkClass} onClick={close}>
                <FiUser /> {t('nav.profile')}
              </NavLink>

              <div className="nav-desktop-lang">
                <LanguageSelector />
              </div>

              <div className="nav-user-capsule">
                <div className="nav-user-avatar">
                  <FiUser />
                </div>
                <div className="nav-user-info">
                  <span className="nav-user-name">{user.name}</span>
                  <span className="nav-user-role client">{t('nav.clientBadge')}</span>
                </div>
              </div>

              <button className="nav-logout-btn" onClick={signOut} title={t('nav.logout')}>
                <FiLogOut /> <span>{t('nav.logout')}</span>
              </button>
            </>
          )}
        </nav>
        </div>
      </header>

      <ConfirmModal
        open={showLogoutModal}
        title={t('confirmation.logoutTitle')}
        message={t('confirmation.logoutMessage')}
        onConfirm={confirmSignOut}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
