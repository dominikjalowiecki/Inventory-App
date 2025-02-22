import { useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Placeholder from 'react-bootstrap/Placeholder';
import Image from 'react-bootstrap/Image';
import { UserStateConsumer } from '../utils/userState';
import undrawReact from '../assets/undraw_react.svg';
import AddUserModal from '../components/AddUserModal';

export default function Profile() {
  const {
    userState: { user },
  } = UserStateConsumer();

  const [showAddModal, setShowAddModal] = useState(false);

  const handleCloseAddModal = () => setShowAddModal(false);
  const handleShowAddModal = () => setShowAddModal(true);

  return (
    <>
      <h3 className='mb-4'>Profil użytkownika</h3>
      <Row>
        <Col md={12} lg={6}>
          <Card>
            <Card.Header>Szczegóły użytkownika</Card.Header>
            <Card.Body>
              {user ? (
                <>
                  <div
                    style={{
                      overflowX: 'auto',
                    }}
                  >
                    <Table className='mb-0' bordered>
                      <tbody>
                        <tr>
                          <td>Adres email</td>
                          <td className='fw-bold'>{user.email}</td>
                        </tr>
                        <tr>
                          <td>Administrator</td>
                          <td className='fw-bold'>
                            {user.admin === true ? (
                              <Badge bg='success' pill>
                                Tak
                              </Badge>
                            ) : (
                              <Badge bg='danger' pill>
                                Nie
                              </Badge>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Utworzono</td>
                          <td className='fw-bold'>
                            {user.createdAt.toLocaleDateString(undefined, {
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
                      </tbody>
                    </Table>
                  </div>
                  {user.admin === true && (
                    <Button
                      variant='danger'
                      className='mt-3'
                      onClick={handleShowAddModal}
                    >
                      <i className='bi bi-plus'></i> Dodaj/nadpisz użytkownika
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Placeholder xs={3} size='lg' />{' '}
                  <Placeholder xs={8} size='lg' />{' '}
                  <Placeholder xs={5} size='lg' />{' '}
                  <Placeholder xs={4} size='lg' />{' '}
                  <Placeholder xs={4} size='lg' />{' '}
                  <Placeholder xs={4} size='lg' />
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={6} className='d-flex justify-content-center'>
          <Image
            src={undrawReact}
            width='60%'
            className='my-5 bg-secondary p-4 shadow'
            rounded
          />
        </Col>
      </Row>
      <AddUserModal show={showAddModal} handleClose={handleCloseAddModal} />
    </>
  );
}
