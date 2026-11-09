import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const normalizeRole = (role) =>
  String(role || '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/^super_admin$|^superadmin$|^administrator$/, 'admin');

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)',
          color: '#0f172a',
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 600,
        }}
      >
        Loading dashboard…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles) {
    const userRole = normalizeRole(user.role);
    const allowed = roles.map((r) => normalizeRole(r));
    if (!allowed.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
