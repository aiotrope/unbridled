//import { Link, NavLink } from 'react-router-dom'
import React from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { useNavigate } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'

const AuthMenu = ({ authUser, setAuthUsername }) => {
  const navigate = useNavigate()

  const onLogout = () => {
    setAuthUsername('')
    localStorage.removeItem('user')
    const user = JSON.parse(localStorage.getItem('user'))
    if (user === null) {
      navigate('/login')
      window.location.reload()
    }
  }
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container style={{ width: '47%' }}>
        <LinkContainer to={'/'}>
          <Navbar.Brand>Library</Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to={'/'}>
              <Nav.Link>Authors</Nav.Link>
            </LinkContainer>
            <LinkContainer to={'/books'}>
              <Nav.Link>Books</Nav.Link>
            </LinkContainer>
            <LinkContainer to={'/add'}>
              <Nav.Link>Add Book</Nav.Link>
            </LinkContainer>

            <Nav.Link href="#pricing">Recommend</Nav.Link>
          </Nav>
          <Nav>
            <LinkContainer to={'/me'}>
              <Button variant="outline-light">{authUser}</Button>
            </LinkContainer>
            <div className="mx-2 my-1"></div>
            <Button variant="info" onClick={onLogout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

const NonAuthMenu = () => (
  <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
    <Container style={{ width: '47%' }}>
      <LinkContainer to={'/'}>
        <Navbar.Brand>Library</Navbar.Brand>
      </LinkContainer>

      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="me-auto">
          <LinkContainer to={'/'}>
            <Nav.Link>Authors</Nav.Link>
          </LinkContainer>
          <LinkContainer to={'/books'}>
            <Nav.Link>Books</Nav.Link>
          </LinkContainer>
        </Nav>
        <Nav>
          <LinkContainer to={'/login'}>
            <Button variant="outline-light">Login</Button>
          </LinkContainer>
          <div className="mx-2 my-1"></div>
          <LinkContainer to={'/signup'}>
            <Button variant="info">Signup</Button>
          </LinkContainer>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
)

export const Menu = ({ authUser, setAuthUsername }) => {
  return authUser ? (
    <AuthMenu authUser={authUser} setAuthUsername={setAuthUsername} />
  ) : (
    <NonAuthMenu />
  )
}
