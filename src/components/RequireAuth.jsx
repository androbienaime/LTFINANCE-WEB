import { Navigate } from 'react-router-dom';
import useAuth from '../lib/useAuth';

export default function RequireAuth({ children }) {
  const { authed } = useAuth();
  return authed ? children : <Navigate to={{ pathname: '/', hash: '#connexion' }} replace />;
}