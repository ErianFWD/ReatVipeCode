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
import ReservationDetail from './pages/ReservationDetail.jsx';
import History from './pages/History.jsx';
import Addons from './pages/Addons.jsx';
import Billing from './pages/Billing.jsx';
import Footer from './components/Footer.jsx';

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
        <Route path="/addons" element={<ProtectedRoute><Addons /></ProtectedRoute>} />
        <Route path="/facturacion" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/historial" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/reserva/:id" element={<ProtectedRoute><ReservationDetail /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin/reservas" element={<AdminRoute><AdminReservations /></AdminRoute>} />
        <Route path="/admin/usuarios" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/acceso-denegado" element={<ProtectedRoute><AccessDenied /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}
