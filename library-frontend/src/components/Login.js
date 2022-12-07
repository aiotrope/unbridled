/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate, Navigate } from 'react-router-dom'
import { LOGIN } from '../graphql/mutations'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { ALL_AUTHORS } from '../graphql/queries'

export const Login = ({
  mounted,
  setSuccessMessage,
  setErrorMessage,
  setToken,
  me,
}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [login, { loading, error, data }] = useMutation(LOGIN, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (mounted && data?.login) {
      setSuccessMessage(data?.login?.successLoginMessage)
      const token = data?.login?.token
      setToken(token)
      localStorage.setItem('token', token)
      let timer
      timer = setTimeout(() => {
        setSuccessMessage('')
        navigate('/')
        clearTimeout(timer)
        window.location.reload()
      }, 3000)
    }
  }, [data?.login, mounted, navigate, setSuccessMessage, setToken])

  useEffect(() => {
    if (mounted && error) {
      setErrorMessage(error.message)
      let timer
      timer = setTimeout(() => {
        setErrorMessage('')
        navigate('/login')
        clearTimeout(timer)
        window.location.reload()
      }, 5000)
    }
    if (
      mounted &&
      error?.message ===
        'Cannot read properties of null (reading \'passwordHash\')'
    ) {
      setErrorMessage(
        'Wrong credentials! Check if you entered your correct username or password'
      )
      let timer
      timer = setTimeout(() => {
        setErrorMessage('')
        navigate('/login')
        clearTimeout(timer)
        window.location.reload()
      }, 5000)
    }
  }, [error, mounted, navigate, setErrorMessage])

  const submit = (event) => {
    event.preventDefault()
    login({ variables: { username, password } })
    setUsername('')
    setPassword('')
  }

  if (loading) {
    return <p>loading...</p>
  }
  if (me !== null) {
    return <Navigate to={'/'} />
  }

  return (
    <Container className="wrapper">
      <h2>Login to your account</h2>
      <Form spellCheck="false" onSubmit={submit} className="mt-2">
        <Row>
          <Col xs={7}>
            <Form.Group className="mb-3 mt-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={({ target }) => setUsername(target.value)}
              />
              <Form.Text className="text-muted">
                Login to your registered username.
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col xs={7}>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={({ target }) => setPassword(target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mt-3">
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form.Group>
      </Form>
    </Container>
  )
}
