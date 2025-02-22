import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { UserStateConsumer } from '../utils/userState';

export default function SignIn() {
  const { signIn } = UserStateConsumer();
  const location = useLocation();
  const { message } = location.state || {};

  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity()) {
      const email = form.email.value;
      const password = form.password.value;

      setLoading(true);
      setError('');
      signIn({ email, password })
        .catch((error) => {
          if (error?.code === 'auth/invalid-credential') {
            setError('Nieprawidłowe dane logowania');
          } else {
            setError('Wystąpił błąd. Spróbuj ponownie później');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }

    setValidated(true);
  }, []);

  return (
    <Row>
      <Col xs={12} md={3} lg={4} />
      <Col xs={12} md={6} lg={4}>
        {message && (
          <Alert variant='warning' className='w-100 mb-4 text-center'>
            {message}
          </Alert>
        )}
        <h3 className='mb-4 text-center'>Zaloguj się</h3>
        <Form
          method='POST'
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >
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
              required
            />
            <Form.Control.Feedback type='invalid'>
              Hasło jest wymagane
            </Form.Control.Feedback>
          </Form.Group>
          <Button
            variant='primary'
            type='submit'
            className='d-block w-100 mt-5'
            disabled={loading}
          >
            <span hidden={!loading}>
              <Spinner size='sm' />{' '}
            </span>
            <i className='bi bi-box-arrow-in-right'></i>{' '}
            <span className='btn-text'>Zaloguj się</span>
          </Button>
          {error && (
            <Alert variant='danger' className='text-center mt-4 mb-0'>
              {error}
            </Alert>
          )}
        </Form>
      </Col>
      <Col xs={12} md={3} lg={4} />
    </Row>
  );
}
