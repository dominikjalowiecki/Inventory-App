import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { UserStateConsumer } from '../utils/userState';

export default function UnauthorizedRoute() {
  const {
    userState: { isLoggedIn },
  } = UserStateConsumer();
  const location = useLocation();
  const { path } = location.state || { path: '/' };

  return isLoggedIn ? <Navigate to={path} replace /> : <Outlet />;
}
