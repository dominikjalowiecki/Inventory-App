import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import UnauthorizedRoute from './components/UnauthorizedRoute';
import AuthorizedRoute from './components/AuthorizedRoute';
import SignIn from './routes/SignIn';
import Home from './routes/Home';
import Profile from './routes/Profile';
import NotFound from './routes/NotFound';
import { UserStateProvider } from './utils/userState';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  return (
    <UserStateProvider>
      <Router>
        <div>
          <section>
            <Routes>
              <Route element={<Main />}>
                <Route element={<UnauthorizedRoute />}>
                  <Route path='/sign-in' element={<SignIn />} />
                </Route>
                <Route element={<AuthorizedRoute />}>
                  <Route path='/' element={<Home />} />
                  <Route path='/profile' element={<Profile />} />
                </Route>
                <Route path='*' element={<NotFound />} />
              </Route>
            </Routes>
          </section>
        </div>
      </Router>
    </UserStateProvider>
  );
}

export default App;
