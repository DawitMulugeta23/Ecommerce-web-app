import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAdmin }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" />;
  if (isAdmin && user.role !== 'admin') return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;