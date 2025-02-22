import { useState, useEffect, useCallback } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { doc, arrayRemove, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';

export default function RemoveElementModal({
  show,
  handleClose,
  handleRevalidate,
  element,
}) {
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const form = e.currentTarget;

      if (form.checkValidity()) {
        setLoading(true);
        setError('');

        try {
          await runTransaction(db, async (transaction) => {
            const docRefElement = doc(db, 'elements', element.id);
            await transaction.delete(docRefElement);

            await transaction.update(
              doc(db, 'categories', element.category.id),
              {
                elements: arrayRemove(docRefElement),
              }
            );
          });

          handleRevalidate();
          handleClose();
        } catch (err) {
          setError('Nie udało się usunąć pozycji');
        } finally {
          setLoading(false);
        }
      }

      setValidated(true);
    },
    [element, handleRevalidate, handleClose]
  );

  useEffect(() => {
    if (show) {
      setValidated(false);
    }
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Usuń pozycję</Modal.Title>
      </Modal.Header>
      <Form
        method='POST'
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
      >
        <Modal.Body>
          Czy na pewno chcesz usunąć pozycję{' '}
          <span className='fw-bold'>
            `{element?.name}
            {element?.model && ` - ${element.model}`}`
          </span>
          ?
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
          <Button variant='danger' type='submit' disabled={loading}>
            <span hidden={!loading}>
              <Spinner size='sm' />{' '}
            </span>
            Usuń
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
