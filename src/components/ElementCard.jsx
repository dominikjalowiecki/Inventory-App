import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Collapse from 'react-bootstrap/Collapse';
import { stateToBackground } from '../utils';

export default function ElementCard({
  element,
  user,
  handleShowEditModal,
  handleShowRemoveModal,
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <Card.Body>
        <Card.Title>
          Pozycja:{' '}
          <span className='fw-bold'>
            {element.name}
            {element.model && ` - ${element.model}`}
          </span>
        </Card.Title>
        <Card.Text>
          Informacja: <span className='fw-bold'>{element.details}</span>
        </Card.Text>
        <div className='mt-3'>
          {!open ? (
            <Button
              variant='outline-secondary'
              size='sm'
              onClick={() => setOpen(true)}
              className='mb-3'
            >
              Pokaż szczegóły <i className='bi bi-caret-down-fill'></i>
            </Button>
          ) : (
            <Button
              variant='outline-secondary'
              size='sm'
              onClick={() => setOpen(false)}
              className='mb-3'
            >
              Ukryj szczegóły <i className='bi bi-caret-up-fill'></i>
            </Button>
          )}
        </div>
        <Collapse in={open}>
          <div
            style={{
              overflowX: 'auto',
            }}
          >
            <Table className='mb-0 element-details-table' bordered>
              <tbody>
                <tr>
                  <td>Cena</td>
                  <td className='fw-bold'>
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                    }).format(element.price)}
                  </td>
                </tr>
                <tr>
                  <td>Ilość sztuk</td>
                  <td className='fw-bold'>{element.quantity}</td>
                </tr>
                <tr>
                  <td>Razem</td>
                  <td className='fw-bold'>
                    {new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                    }).format(element.price * element.quantity)}
                  </td>
                </tr>
                <tr>
                  <td>Źródło</td>
                  <td className='fw-bold'>{element.source.name}</td>
                </tr>
                <tr>
                  <td>Stan</td>
                  <td className='fw-bold'>
                    <Badge
                      bg={stateToBackground(element.state)}
                      text='dark'
                      className='px-4'
                      pill
                    >
                      {element.state}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td>Użytkownik zmodyfikował</td>
                  <td className='fw-bold'>{element.modification.user.name}</td>
                </tr>
                <tr>
                  <td>Czas modyfikacji</td>
                  <td className='fw-bold'>
                    {new Date(
                      element.modification.timestamp.seconds * 1000
                    ).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      second: 'numeric',
                    })}
                  </td>
                </tr>
                <tr>
                  <td>Dokumenty</td>
                  <td className='fw-bold'>
                    {element.files && (
                      <div
                        style={{
                          maxHeight: '150px',
                          overflowY: 'auto',
                        }}
                      >
                        <ul>
                          {element.files.map((file) => (
                            <li key={file.id}>
                              <a href={file.url} target='_blank'>
                                {file.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Collapse>
        {user?.admin === true && (
          <>
            <Button
              variant='primary'
              className='mt-3 me-3'
              onClick={() => handleShowEditModal(element)}
            >
              <i className='bi bi-pencil-square'></i> Edytuj pozycję
            </Button>
            <Button
              variant='danger'
              className='mt-3'
              onClick={() => handleShowRemoveModal(element)}
            >
              <i className='bi bi-trash3'></i> Usuń pozycję
            </Button>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
