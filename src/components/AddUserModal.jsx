import { useState, useCallback, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';

export default function AddUserModal({ show, handleClose }) {
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const form = e.currentTarget;

      if (form.checkValidity()) {
        const displayName = form.displayName.value;
        const email = form.email.value;
        const password = form.password.value;
        const repassword = form.repassword.value;
        const admin = form.admin.checked;

        if (password !== repassword) {
          setError('Hasła muszą się zgadzać');
          return;
        }

        setLoading(true);
        setError('');
        axios
          .post('/users', {
            displayName,
            email,
            password,
            role: admin ? 'admin' : 'user',
          })
          .then((response) => {
            handleClose();
          })
          .catch((err) => {
            setError('Nie udało się dodać/nadpisać użytkownika');
          })
          .finally(() => {
            setLoading(false);
          });
      }

      setValidated(true);
    },
    [handleClose]
  );

  useEffect(() => {
    if (show) {
      setValidated(false);
      setError('');
    }
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Dodaj/nadpisz użytkownika</Modal.Title>
      </Modal.Header>
      <Form
        method='POST'
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
      >
        <Modal.Body>
          <Form.Group
            className='mb-3 form-group required'
            controlId='display-name'
          >
            <Form.Label>Nazwa użytkownika</Form.Label>
            <Form.Control
              type='text'
              name='displayName'
              placeholder='Nazwa użytkownika'
              maxLength='80'
              required
            />
            <Form.Control.Feedback type='invalid'>
              Nazwa użytkownika jest wymagana
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className='mb-3 form-group required' controlId='email'>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type='email'
              name='email'
              placeholder='Email'
              required
            />
            <Form.Control.Feedback type='invalid'>
              Nieprawidłowy format adresu email
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className='mb-3 form-group required' controlId='password'>
            <Form.Label>Hasło</Form.Label>
            <Form.Control
              type='password'
              name='password'
              placeholder='Hasło'
              pattern='^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+\-]).{8,}$'
              required
            />
            <Form.Text>
              Minimum 8 znaków, 1 duża litera, 1 mała litera,
              <br />1 cyfra i 1 znak specjalny
            </Form.Text>
            <Form.Control.Feedback type='invalid'>
              Nieprawidłowy format hasła
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group
            className='mb-3 form-group required'
            controlId='repassword'
          >
            <Form.Label>Powtórz hasło</Form.Label>
            <Form.Control
              type='password'
              name='repassword'
              placeholder='Powtórz hasło'
              pattern='^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+\-]).{8,}$'
              required
            />
            <Form.Control.Feedback type='invalid'>
              Nieprawidłowy format powtórzonego hasła
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Check
              type='switch'
              name='admin'
              label='Czy jest administratorem?'
              id='admin'
            />
          </Form.Group>
          {error && (
            <Alert variant='danger' className='text-center mt-4 mb-0'>
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Zamknij
          </Button>
          <Button variant='primary' type='submit' disabled={loading}>
            <span hidden={!loading}>
              <Spinner size='sm' />{' '}
            </span>
            Dodaj/nadpisz
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
