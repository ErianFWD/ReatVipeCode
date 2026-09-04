import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiCalendar, FiLogOut, FiMenu, FiUser, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);
  const signOut = () => {
    logout();
    close();
    navigate('/login');
  };

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <header className="navbar-shell">
      <div className="container navbar">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">R</span>
          <span>
            <strong>ReservaPro</strong>
            <small>Hotel Boutique & Restaurant</small>
          </span>
        </Link>

        <button className="menu-toggle" onClick={() => setOpen((v) => !v)} aria-label="Abrir menú">
          {open ? <FiX /> : <FiMenu />}
        </button>

        <nav className={`nav-links${open ? ' open' : ''}`}>
          {!user ? (
            <>
              <NavLink to="/" className={linkClass} onClick={close}>Inicio</NavLink>
              <Link to="/login" className="button nav-cta" onClick={close}>Iniciar sesión</Link>
            </>
          ) : user.role === 'admin' ? (
            <>
              <NavLink to="/dashboard" className={linkClass} onClick={close}>Dashboard</NavLink>
              <NavLink to="/admin/reservas" className={linkClass} onClick={close}>Reservas</NavLink>
              <NavLink to="/admin/usuarios" className={linkClass} onClick={close}>Usuarios</NavLink>
              <div className="nav-user"><FiUser /><span>{user.name}</span><small>Admin</small></div>
              <button className="nav-logout" onClick={signOut}><FiLogOut /> Salir</button>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className={linkClass} onClick={close}>Dashboard</NavLink>
              <NavLink to="/reservar" className={linkClass} onClick={close}><FiCalendar /> Reservar</NavLink>
              <NavLink to="/mis-reservas" className={linkClass} onClick={close}>Mis reservas</NavLink>
              <NavLink to="/perfil" className={linkClass} onClick={close}>Perfil</NavLink>
              <div className="nav-user"><FiUser /><span>{user.name}</span><small>Cliente</small></div>
              <button className="nav-logout" onClick={signOut}><FiLogOut /> Salir</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
