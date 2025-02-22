import { Outlet, Navigate } from 'react-router-dom';
import { UserStateConsumer } from '../utils/userState';

export default function AuthorizedRoute() {
  const {
    userState: { isLoggedIn },
  } = UserStateConsumer();

  return !isLoggedIn ? (
    <Navigate
      to='sign-in'
      replace
      state={{
        path: location.pathname,
        message: 'Musisz być zalogowany, aby przejść dalej',
      }}
    />
  ) : (
    <Outlet />
  );
}
