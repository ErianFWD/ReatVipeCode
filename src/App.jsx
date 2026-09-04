import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewReservation from './pages/NewReservation.jsx';
import MyReservations from './pages/MyReservations.jsx';
import Profile from './pages/Profile.jsx';
import AdminReservations from './pages/AdminReservations.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AccessDenied from './pages/AccessDenied.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/reservar" element={<ProtectedRoute><NewReservation /></ProtectedRoute>} />
        <Route path="/mis-reservas" element={<ProtectedRoute><MyReservations /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin/reservas" element={<AdminRoute><AdminReservations /></AdminRoute>} />
        <Route path="/admin/usuarios" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/acceso-denegado" element={<ProtectedRoute><AccessDenied /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer className="footer">
        <div className="container footer-inner">
          <div><strong>ReservaPro</strong><span>Hotel Boutique & Restaurant</span></div>
          <p>Proyecto académico · React + JSON Server · Autenticación y roles simulados.</p>
        </div>
      </footer>
    </div>
  );
}
