import { useEffect, useState, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Dropdown from 'react-bootstrap/Dropdown';
import CategoryCard from '../components/CategoryCard';
import AddElementModal from '../components/AddElementModal';
import EditElementModal from '../components/EditElementModal';
import RemoveElementModal from '../components/RemoveElementModal';
import { UserStateConsumer } from '../utils/userState';

export default function Home() {
  const {
    userState: { isLoggedIn, user },
  } = UserStateConsumer();

  const [data, setData] = useState(null);
  const [categories, setCategories] = useState(null);
  const [sources, setSources] = useState(null);

  const initFilters = useMemo(
    () => ({
      search: '',
      category: '',
      source: '',
    }),
    []
  );
  const [filters, setFilters] = useState(initFilters);
  const [submittedFilters, setSubmittedFilters] = useState(filters);

  const [revalidate, setRevalidate] = useState({});

  useEffect(() => {
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

    if (isLoggedIn) {
      getCategories();
      getSources();
    }
  }, [isLoggedIn, revalidate]);

  useEffect(() => {
    let unsubscribe = null;

    const getData = () => {
      setData(null);
      const q = submittedFilters.category
        ? query(
            collection(db, 'categories'),
            where('name', '==', submittedFilters.category),
            orderBy('name')
          )
        : query(collection(db, 'categories'), orderBy('name'));
      unsubscribe = onSnapshot(q, async (querySnapshotCategories) => {
        const data = [];
        for (const docCategory of querySnapshotCategories.docs) {
          const category = docCategory.data();
          const elements = [];

          for (const docElement of category.elements) {
            const querySnapshotElement = await getDoc(docElement);
            const element = querySnapshotElement.data();

            const searchString = submittedFilters.search.trim().toLowerCase();
            if (
              searchString &&
              element.name.toLowerCase().indexOf(searchString) === -1 &&
              element.model.toLowerCase().indexOf(searchString) === -1 &&
              element.details.toLowerCase().indexOf(searchString) === -1
            ) {
              continue;
            }

            const querySnapshotSource = await getDoc(element.source);
            const source = querySnapshotSource.data();

            if (
              submittedFilters.source &&
              source.name !== submittedFilters.source
            ) {
              continue;
            }

            elements.push({
              id: docElement.id,
              ...element,
              source: {
                id: querySnapshotSource.id,
                ...source,
              },
              category: {
                id: docCategory.id,
                name: category.name,
              },
            });
          }

          if (elements.length > 0) {
            data.push({
              id: docCategory.id,
              ...category,
              elements,
            });
          }
        }

        setData(data);
      });
    };

    if (isLoggedIn) {
      getData();
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    };
  }, [isLoggedIn, submittedFilters, revalidate]);

  const [showAddModal, setShowAddModal] = useState(false);

  const handleCloseAddModal = () => setShowAddModal(false);
  const handleShowAddModal = () => setShowAddModal(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [element, setElement] = useState(null);

  const handleCloseEditModal = () => setShowEditModal(false);
  const handleShowEditModal = (element) => {
    setShowEditModal(true);
    setElement(element);
  };

  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const handleCloseRemoveModal = () => setShowRemoveModal(false);
  const handleShowRemoveModal = (element) => {
    setShowRemoveModal(true);
    setElement(element);
  };

  const handleFiltersChange = (event) => {
    const { name, value } = event.target;
    setFilters((filters) => ({
      ...filters,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    setSubmittedFilters(filters);
  };

  const handleReset = () => {
    setFilters(initFilters);
    setSubmittedFilters(initFilters);
  };

  const handleRevalidate = () => {
    setRevalidate({});
  };

  return (
    <>
      <h3 className='mb-4'>Strona główna</h3>
      <Row className='g-4'>
        <Col md={6}>
          {user?.admin === true && (
            <Button variant='danger' onClick={handleShowAddModal}>
              <i className='bi bi-plus'></i> Utwórz pozycję
            </Button>
          )}
        </Col>
        <Col md={6} className='d-flex justify-content-end'>
          <Dropdown align='end'>
            <Dropdown.Toggle variant='success' id='dropdown-basic'>
              <i className='bi bi-funnel'></i> Wyszukaj pozycję
            </Dropdown.Toggle>

            <Dropdown.Menu className='p-3'>
              <Form.Group className='mb-3' controlId='search'>
                <Form.Label>Wyszukaj</Form.Label>
                <Form.Control
                  type='search'
                  name='search'
                  value={filters.search}
                  placeholder='Wpisz frazę'
                  aria-label='Wpisz frazę'
                  style={{
                    width: '16rem',
                  }}
                  onChange={handleFiltersChange}
                />
              </Form.Group>
              <Form.Group className='mb-3' controlId='category'>
                <Form.Label>Kategoria</Form.Label>
                <Form.Select
                  name='category'
                  value={filters.category}
                  aria-label='Kategoria'
                  onChange={handleFiltersChange}
                >
                  <option value=''>Wybierz kategorię</option>
                  {categories &&
                    categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className='mb-3' controlId='source'>
                <Form.Label>Źródło</Form.Label>
                <Form.Select
                  name='source'
                  value={filters.source}
                  aria-label='Źródło'
                  onChange={handleFiltersChange}
                >
                  <option value=''>Wybierz źródło</option>
                  {sources &&
                    sources.map((source) => (
                      <option key={source.id} value={source.name}>
                        {source.name}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
              <Button onClick={handleSearch} className='me-3'>
                Szukaj
              </Button>
              <Button onClick={handleReset} variant='outline-secondary'>
                Reset
              </Button>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      <Row className='g-4 mt-3'>
        {data ? (
          <>
            {data.length > 0 ? (
              <>
                {data.map((category) => (
                  <Col key={category.id} xs={12}>
                    <CategoryCard
                      category={category}
                      user={user}
                      handleShowEditModal={handleShowEditModal}
                      handleShowRemoveModal={handleShowRemoveModal}
                    />
                  </Col>
                ))}
              </>
            ) : (
              <h3 className='text-center'>Nie znaleziono pozycji...</h3>
            )}
          </>
        ) : (
          <div className='text-center'>
            <Spinner />
          </div>
        )}
      </Row>
      <AddElementModal
        show={showAddModal}
        handleClose={handleCloseAddModal}
        handleRevalidate={handleRevalidate}
        user={user}
      />
      <EditElementModal
        show={showEditModal}
        handleClose={handleCloseEditModal}
        handleRevalidate={handleRevalidate}
        user={user}
        element={element}
      />
      <RemoveElementModal
        show={showRemoveModal}
        handleClose={handleCloseRemoveModal}
        handleRevalidate={handleRevalidate}
        element={element}
      />
    </>
  );
}
