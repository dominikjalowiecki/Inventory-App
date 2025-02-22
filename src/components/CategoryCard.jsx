import { useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import ElementCard from './ElementCard';

export default function CategoryCard({
  category,
  user,
  handleShowEditModal,
  handleShowRemoveModal,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className='mb-3'>
        <Card.Body>
          <Card.Title>
            Kategoria: <span className='fw-bold'>{category.name}</span>
          </Card.Title>
          <Card.Text>Sprawdź elementy należące do kategorii.</Card.Text>
          <div className='text-end mt-3'>
            {!open ? (
              <Button variant='primary' onClick={() => setOpen(true)}>
                Pokaż elementy <i className='bi bi-caret-down-fill'></i>
              </Button>
            ) : (
              <Button variant='primary' onClick={() => setOpen(false)}>
                Ukryj elementy <i className='bi bi-caret-up-fill'></i>
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
      <Collapse in={open}>
        <Row className='g-3 justify-content-end'>
          {category.elements.map((element) => (
            <Col key={element.id} xs={11} md={10}>
              <ElementCard
                element={element}
                user={user}
                handleShowEditModal={handleShowEditModal}
                handleShowRemoveModal={handleShowRemoveModal}
              />
            </Col>
          ))}
        </Row>
      </Collapse>
    </>
  );
}
