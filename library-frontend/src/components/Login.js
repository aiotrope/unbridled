/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useRef } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate, Navigate } from 'react-router-dom'
import { LOGIN } from '../graphql/mutations'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import { ALL_AUTHORS } from '../graphql/queries'

export const Login = ({
  mounted,
  setSuccessMessage,
  setErrorMessage,
  authUser,
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
      localStorage.setItem('user', JSON.stringify(data?.login))
      let timer
      timer = setTimeout(() => {
        setSuccessMessage('')
        navigate('/')
        clearTimeout(timer)
        window.location.reload()
      }, 3000)
    }
  }, [data?.login, mounted, navigate, setSuccessMessage])

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
  if (authUser !== null) {
    return <Navigate to={'/'} />
  } 

  console.log(data?.login)
  return (
    <Container className="forms">
      <h2>Login to your account</h2>
      <Form onSubmit={submit}>
        <Form.Group className="mb-3" controlId="username">
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

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container>
  )
}
