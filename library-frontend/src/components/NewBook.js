import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Navigate, useNavigate } from 'react-router-dom'
import { ADD_BOOK } from '../graphql/mutations'
import { ALL_AUTHORS, ALL_BOOKS, ALL_GENRES } from '../graphql/queries'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import pkg from 'lodash'

const { cloneDeep } = pkg

const NewBook = ({ mounted, setSuccessMessage, setErrorMessage, me }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const genreQuery = useQuery(ALL_GENRES)
  const authorQuery = useQuery(ALL_AUTHORS)
  const genreRef = useRef(null)
  const navigate = useNavigate()

  const [addBook, { error, loading, data }] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
  })

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
    if (mounted && data?.addBook) {
      setSuccessMessage(`New book entitled: ${title} added!`)
      let timer
      timer = setTimeout(() => {
        setSuccessMessage('')
        setTitle('')
        setAuthor('')
        setPublished('')
        setGenre('')
        setGenres([])
        navigate('/books')
        clearTimeout(timer)
      }, 4000)
    }
  }, [author, data?.addBook, mounted, navigate, setSuccessMessage, title])

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

  useEffect(() => {
    if (mounted && authorQuery.error) {
      setErrorMessage(authorQuery?.error?.message)
      let timer
      timer = setTimeout(() => {
        setErrorMessage('')
        clearTimeout(timer)
      }, 5000)
    }
  }, [authorQuery?.error, mounted, setErrorMessage])

  useEffect(() => {
    if (mounted && genreQuery.error) {
      setErrorMessage(genreQuery?.error?.message)
      let timer
      timer = setTimeout(() => {
        setErrorMessage('')
        clearTimeout(timer)
      }, 5000)
    }
  }, [genreQuery.error, mounted, setErrorMessage])

  const submit = async (event) => {
    event.preventDefault()
    const _pub = Number(event.target.published.value)

    addBook({
      variables: {
        title: title,
        published: _pub,
        author: author,
        genres: genres,
      },
    })
  }

  const onChangeHandler = (event) => {
    event.persist()
    setGenre(event.target.value)
  }

  const genreClone = cloneDeep(genreQuery?.data?.allGenres)

  if (loading || genreQuery.loading || authorQuery.loading) {
    return <p>loading...</p>
  }

  if (me === null) {
    return <Navigate to={'/login'} />
  }

  return (
    <Container className="wrapper">
      <h2>Add Book Entry</h2>
      <Form spellCheck="false" onSubmit={submit}>
        <Form.Group className="mb-3 mt-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            placeholder="Enter book title"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </Form.Group>
        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label htmlFor="author">Author</Form.Label>
            <Form.Select
              name="author"
              onChange={({ target }) => setAuthor(target.value)}
            >
              <option>-- select an option --</option>
              {authorQuery?.data?.allAuthors.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Published</Form.Label>
            <Form.Control
              placeholder="Year published"
              type="number"
              name="published"
              value={published}
              onChange={({ target }) => setPublished(target.value)}
            />
          </Form.Group>
        </Row>
        <Row className="mb-3 mt-3">
          <Form.Group className="mb-3">
            <Form.Label>Genre category (choose at least one)</Form.Label>
            <Col xs={12}>
              {genreClone.map((genre) => (
                <div key={genre.id} className="form-check form-check-inline">
                  <input
                    className="form-check-input mb-3"
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
            </Col>
          </Form.Group>
        </Row>
        <Form.Group>
          <Button
            type="submit"
            variant="outline-info"
            className="btn btn-lg btn-block"
          >
            Create Book
          </Button>
        </Form.Group>
      </Form>
    </Container>
  )
}

export default NewBook
