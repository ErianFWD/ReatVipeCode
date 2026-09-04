import { Navigate } from 'react-router-dom';
import Loader from './Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader text="Verificando permisos..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/acceso-denegado" replace />;
  return children;
}
