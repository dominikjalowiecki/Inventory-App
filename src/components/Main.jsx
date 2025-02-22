import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { UserStateConsumer } from '../utils/userState';

export default function Main() {
  const {
    userState: { isLoggedIn, user },
    signOut,
  } = UserStateConsumer();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut().then(() => navigate('/sign-in'));
  };

  return (
    <>
      <header
        style={{
          height: '3.5rem',
          marginBottom: '-3.5rem',
        }}
      >
        <Navbar expand='md' className='bg-body-tertiary mb-3'>
          <Container>
            <Navbar.Brand as={Link} to='/'>
              Projekt inwentarza
            </Navbar.Brand>
            <Navbar.Toggle aria-controls='offcanvasNavbar-expand' />
            <Navbar.Offcanvas
              id='offcanvasNavbar-expand'
              aria-labelledby='offcanvasNavbarLabel-expand'
              placement='end'
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id='offcanvasNavbarLabel-expand'>
                  Menu nawigacyjne
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className='justify-content-end flex-grow-1 pe-3'>
                  {isLoggedIn ? (
                    <>
                      <Nav.Link as={NavLink} to='/'>
                        Strona główna
                      </Nav.Link>
                      <NavDropdown
                        title={
                          <span className='user-name'>
                            {user?.displayName || ''}
                          </span>
                        }
                        id={'offcanvasNavbarDropdown-expand'}
                        align='end'
                      >
                        <NavDropdown.Item as={NavLink} to='/profile'>
                          Profil użytkownika
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item as={Button} onClick={handleSignOut}>
                          <i className='bi bi-box-arrow-in-left'></i> Wyloguj
                          się
                        </NavDropdown.Item>
                      </NavDropdown>
                    </>
                  ) : (
                    <>
                      <Nav.Link as={NavLink} to='/sign-in'>
                        Zaloguj się
                      </Nav.Link>
                    </>
                  )}
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      </header>
      <main
        style={{
          minHeight: '100vh',
          padding: '7.5rem 0 8rem 0',
        }}
      >
        <Container>
          <Outlet />
        </Container>
      </main>
      <footer
        className='border-top d-flex align-items-center'
        style={{
          height: '4rem',
          marginTop: '-4rem',
        }}
      >
        <Container className='text-center'>
          <a
            href='https://github.com/dominikjalowiecki'
            target='_blank'
            className='text-light'
          >
            Dominik Jałowiecki &copy; 2024
          </a>
        </Container>
      </footer>
    </>
  );
}
