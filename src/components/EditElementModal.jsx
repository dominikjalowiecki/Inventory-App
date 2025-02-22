import { useState, useCallback, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { v4 as uuid } from 'uuid';
import {
  collection,
  getDocs,
  doc,
  arrayUnion,
  arrayRemove,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../firebase';

export default function EditElementModal({
  show,
  handleClose,
  handleRevalidate,
  user,
  element,
}) {
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const [fileUploadingProgress, setFileUploadingProgress] = useState(0);
  const [fileSuccess, setFileSuccess] = useState('');
  const [fileError, setFileError] = useState('');
  const [sources, setSources] = useState(null);
  const [categories, setCategories] = useState(null);
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const form = e.currentTarget;

      if (form.checkValidity()) {
        const name = form.name.value;
        const model = form.model.value;
        const price = form.price.value;
        const quantity = form.quantity.value;
        const state = form.state.value;
        const source = form.source.value;
        const category = form.category.value;
        const details = form.details.value;

        setLoading(true);
        setError('');

        try {
          await runTransaction(db, async (transaction) => {
            const docRefSource = doc(db, 'sources', source);
            await transaction.set(
              docRefSource,
              {
                name: source,
              },
              { merge: true }
            );

            const docRefElement = doc(db, 'elements', element.id);
            await transaction.update(docRefElement, {
              details,
              model,
              modification: {
                timestamp: new Date(),
                user: {
                  name: user.displayName,
                  uid: user.uid,
                },
              },
              name,
              price,
              quantity,
              source: docRefSource,
              state,
            });

            await transaction.update(
              doc(db, 'categories', element.category.id),
              {
                elements: arrayRemove(docRefElement),
              }
            );

            const docRefCategory = doc(db, 'categories', category);
            await transaction.set(
              docRefCategory,
              {
                name: category,
                elements: arrayUnion(docRefElement),
              },
              { merge: true }
            );
          });

          handleRevalidate();
          handleClose();
        } catch (err) {
          setError('Nie udało się utworzyć pozycji');
        } finally {
          setLoading(false);
        }
      }

      setValidated(true);
    },
    [user, element, handleRevalidate, handleClose]
  );

  const handleFileUpload = useCallback(
    (event) => {
      event.preventDefault();
      const target = event.target;
      const file = target.files[0];

      if (!file) {
        return;
      }

      const fileSizeLimit = 1048576; // 1MB

      if (file.size > fileSizeLimit) {
        alert('Dozwolone pliki o rozmiarze do 1MB');
        setFileError('Nie udało się dodać dokumentu');
        target.value = '';
        return;
      }

      const newUuid = uuid();
      const storageRef = ref(storage, `files/${newUuid}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setFileUploading(true);
      setFileSuccess('');
      setFileError('');

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setFileUploadingProgress(progress);
        },
        (err) => {
          target.value = '';
          setFileUploading(false);
          setFileUploadingProgress(0);
          setFileError('Nie udało się dodać dokumentu');
        },
        () => {
          target.value = '';
          try {
            getDownloadURL(uploadTask.snapshot.ref).then(
              async (downloadURL) => {
                const docRefElement = doc(db, 'elements', element.id);
                await updateDoc(docRefElement, {
                  files: arrayUnion({
                    id: newUuid,
                    name: file.name,
                    url: downloadURL,
                  }),
                });

                setFileUploading(false);
                setFileUploadingProgress(0);
                setFileSuccess('Pomyślnie dodano dokument');
                handleRevalidate();
              }
            );
          } catch (err) {
            setFileUploading(false);
            setFileUploadingProgress(0);
            setFileError('Nie udało się dodać dokumentu');
          }
        }
      );
    },
    [element, handleRevalidate]
  );

  useEffect(() => {
    const getSources = () => {
      getDocs(collection(db, 'sources')).then((querySnapshot) => {
        const sources = [];
        for (const doc of querySnapshot.docs) {
          const source = doc.data();
          sources.push({
            id: doc.id,
            ...source,
          });
        }
        setSources(sources);
      });
    };
    const getCategories = () => {
      getDocs(collection(db, 'categories')).then((querySnapshot) => {
        const categories = [];
        for (const doc of querySnapshot.docs) {
          const category = doc.data();
          categories.push({
            id: doc.id,
            ...category,
          });
        }
        setCategories(categories);
      });
    };

    if (show) {
      setValidated(false);
      setSources(null);
      setCategories(null);
      getSources();
      getCategories();
      setError('');
      setFileSuccess('');
      setFileError('');
    }
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose} size='lg' centered>
      <Modal.Header closeButton>
        <Modal.Title>Edytuj pozycję</Modal.Title>
      </Modal.Header>
      <Form
        method='POST'
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
      >
        <Modal.Body>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className='mb-3 form-group required' controlId='name'>
                <Form.Label>Nazwa</Form.Label>
                <Form.Control
                  type='text'
                  name='name'
                  placeholder='Nazwa'
                  defaultValue={element?.name}
                  required
                />
                <Form.Control.Feedback type='invalid'>
                  Nazwa jest wymagana
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className='mb-3 form-group' controlId='model'>
                <Form.Label>Model</Form.Label>
                <Form.Control
                  type='text'
                  name='model'
                  placeholder='Model'
                  defaultValue={element?.model}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group
                className='mb-3 form-group required'
                controlId='price'
              >
                <Form.Label>Cena</Form.Label>
                <InputGroup>
                  <Form.Control
                    type='number'
                    min='0'
                    step='0.01'
                    name='price'
                    placeholder='Cena'
                    defaultValue={element?.price}
                    required
                  />
                  <InputGroup.Text id='price-addon'>zł</InputGroup.Text>
                </InputGroup>
                <Form.Control.Feedback type='invalid'>
                  Nieprawidłowy format ceny
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group
                className='mb-3 form-group required'
                controlId='quantity'
              >
                <Form.Label>Ilość</Form.Label>
                <InputGroup>
                  <Form.Control
                    type='number'
                    min='0'
                    step='1'
                    name='quantity'
                    placeholder='Ilość'
                    defaultValue={element?.quantity}
                    required
                  />
                  <InputGroup.Text id='quantity-addon'>sztuk</InputGroup.Text>
                </InputGroup>
                <Form.Control.Feedback type='invalid'>
                  Ilość jest wymagana
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group
                className='mb-3 form-group required'
                controlId='state'
              >
                <Form.Label>Stan</Form.Label>
                <Form.Select
                  name='state'
                  aria-label='Stan'
                  defaultValue={element?.state}
                  required
                >
                  <option value=''>Wybierz stan</option>
                  <option value='OK'>Ok</option>
                  <option value='POŻYCZONY'>Pożyczony</option>
                  <option value='USZKODZONY'>Uszkodzony</option>
                </Form.Select>
                <Form.Control.Feedback type='invalid'>
                  Stan jest wymagany
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group
                className='mb-3 form-group required'
                controlId='source'
              >
                <Form.Label>Źródło</Form.Label>
                <Form.Control
                  type='text'
                  list='source-list'
                  name='source'
                  placeholder='Źródło'
                  defaultValue={element?.source.id}
                  required
                />
                <datalist id='source-list'>
                  {sources &&
                    sources.map((source) => (
                      <option key={source.id} value={source.name} />
                    ))}
                </datalist>
                <Form.Control.Feedback type='invalid'>
                  Źródło jest wymagane
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group
                className='mb-3 form-group required'
                controlId='category'
              >
                <Form.Label>Kategoria</Form.Label>
                <Form.Control
                  type='text'
                  list='category-list'
                  name='category'
                  placeholder='Kategoria'
                  defaultValue={element?.category.id}
                  required
                />
                <datalist id='category-list'>
                  {categories &&
                    categories.map((category) => (
                      <option key={category.id} value={category.name} />
                    ))}
                </datalist>
                <Form.Control.Feedback type='invalid'>
                  Kategoria jest wymagana
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className='mb-3' controlId='formFileMultiple'>
                <Form.Label>Dodaj dokument</Form.Label>
                <Form.Control
                  type='file'
                  name='file'
                  onChange={handleFileUpload}
                  disabled={fileUploading}
                />
                <ProgressBar
                  now={fileUploadingProgress}
                  label={`${fileUploadingProgress}%`}
                  visuallyHidden
                  className='mt-1'
                  style={{
                    height: '0.5rem',
                  }}
                  hidden={!fileUploading}
                />
                <Form.Text className='text-muted'>
                  Dozwolone pliki o rozmiarze do 1MB
                </Form.Text>
                {fileSuccess && (
                  <Form.Control.Feedback type='valid' className='d-block'>
                    {fileSuccess}
                  </Form.Control.Feedback>
                )}
                {fileError && (
                  <Form.Control.Feedback type='invalid' className='d-block'>
                    {fileError}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group className='mb-3 form-group' controlId='details'>
                <Form.Label>Informacje</Form.Label>
                <Form.Control
                  as='textarea'
                  name='details'
                  placeholder='Informacje'
                  defaultValue={element?.details}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              {error && (
                <Alert variant='danger' className='text-center mt-4 mb-0'>
                  {error}
                </Alert>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Zamknij
          </Button>
          <Button variant='primary' type='submit' disabled={loading}>
            <span hidden={!loading}>
              <Spinner size='sm' />{' '}
            </span>
            Edytuj
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
