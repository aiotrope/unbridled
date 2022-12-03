/* eslint-disable react/no-unescaped-entities */
import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { ALL_GENRES } from '../graphql/queries'
import { CREATE_USER } from '../graphql/mutations'
import { useNavigate, Navigate } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import pkg from 'lodash'
const { cloneDeep } = pkg

export const Signup = ({
  mounted,
  setSuccessMessage,
  setErrorMessage,
  authUser,
}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  const genreRef = useRef(null)
  const formRef = useRef()

  const genreQuery = useQuery(ALL_GENRES)
  const [createUser, { loading, error, data }] = useMutation(CREATE_USER)
  const navigate = useNavigate()

  useEffect(() => {
    if (mounted) {
      genreRef.current = genre
      if (genreRef.current) {
        setGenres((genres) => [...genres, genreRef.current])
        let genreSelected = document.getElementById(`${genreRef.current}`)
        genreSelected.checked = true
        genreSelected.disabled = true
      }
    }
  }, [genre, mounted])

  useEffect(() => {
    if (mounted && data?.createUser) {
      setSuccessMessage(data?.createUser?.successSignupMessage)
      let timer
      timer = setTimeout(() => {
        setSuccessMessage('')
        navigate('/login')
        clearTimeout(timer)
      }, 3000)
    }
  }, [data?.createUser, mounted, navigate, setSuccessMessage])

  useEffect(() => {
    if (mounted && error) {
      setErrorMessage(error.message)
      let timer
      timer = setTimeout(() => {
        setErrorMessage('')
        clearTimeout(timer)
      }, 5000)
    }
  }, [error, mounted, setErrorMessage])

  if (genreQuery.loading || loading) return <p>loading...</p>
  if (genreQuery.error) return `Error: ${genreQuery.error.message}`
  if (authUser !== null) {
    return <Navigate to={'/'} />
  }

  const submit = (event) => {
    event.preventDefault()
    createUser({
      variables: {
        createUserInput: {
          username: username,
          password: password,
          favoriteGenre: genres,
        },
      },
    })
  }

  const onChangeHandler = (event) => {
    event.persist()
    setGenre(event.target.value)
  }

  const genreClone = cloneDeep(genreQuery?.data?.allGenres)

  return (
    <Container className="wrapper">
      <h2>Create an account</h2>
      <Form ref={formRef} className="mt-3" onSubmit={submit}>
        <Row>
          <Form.Group as={Col} controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter a username"
              onChange={({ target }) => setUsername(target.value)}
            />
            <Form.Text className="text-muted">
              Five characters in length. Upper/lower case, numbers and special
              characters are allowed.
            </Form.Text>
          </Form.Group>

          <Form.Group as={Col} controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter a password"
              onChange={({ target }) => setPassword(target.value)}
            />
            <Form.Text className="text-muted">
              Three characters in length. Upper/lower case, numbers and special
              characters are allowed.
            </Form.Text>
          </Form.Group>
        </Row>

        <Form.Group className="mb-3 mt-3">
          <Form.Label>Select at least one genre</Form.Label>
          <br />
          {genreClone.map((genre) => (
            <div key={genre.id} className="form-check form-check-inline">
              <input
                className="form-check-input mb-4"
                type="checkbox"
                name={genre.category}
                id={genre.id}
                value={genre.id}
                onChange={onChangeHandler}
              />
              <label className="form-check-label" htmlFor={genre.category}>
                {genre.category
                  .charAt(0)
                  .toUpperCase()
                  .concat(genre.category.substring(1))}
              </label>
            </div>
          ))}
        </Form.Group>

        <Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form.Group>
      </Form>
    </Container>
  )
}
