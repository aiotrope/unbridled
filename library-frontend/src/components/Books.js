import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../graphql/queries'
import { ALL_GENRES } from '../graphql/queries'
import Table from 'react-bootstrap/Table'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import pkg from 'lodash'

const { cloneDeep, orderBy } = pkg

const Books = ({ mounted, setErrorMessage, genre }) => {
  const [books, setBooks] = useState([])
  const [genres, setGenres] = useState([])
  const [categorization, setCategorization] = useState('')
  const [category, setCategory] = useState('All Genre')
  const { loading, error, data, refetch } = useQuery(ALL_BOOKS, {
    variables: genre,
  })

  const genreQuery = useQuery(ALL_GENRES)

  useEffect(() => {
    if (mounted && data?.allBooks) {
      setBooks(cloneDeep(data?.allBooks))
      setGenres(cloneDeep(genreQuery?.data?.allGenres))
      if (category === 'All Genre') {
        refetch({ genre: '' })
      }
    }
  }, [category, data?.allBooks, genreQuery?.data?.allGenres, mounted, refetch])

  useEffect(() => {
    if (mounted && categorization) {
      refetch({ genre: categorization })
    }
  }, [categorization, mounted, refetch])

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

  const onClick = (event) => {
    event.persist()
    const target = event.target.value
    setCategorization(target)
    setCategory(`In genre ${event.target.value}`)
  }

  const sorted = orderBy(books, ['published'], ['desc'])

  if (loading || genreQuery.loading) {
    return <p>loading...</p>
  }

  ///console.log(data.allBooks)
  return (
    <Container className="wrapper">
      <h2>Books</h2>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Books</th>
            <th>Author</th>
            <th>Published</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ id, title, author, published }) => (
            <tr key={id}>
              <td>{title}</td>
              <td key={id}>{author.name}</td>
              <td>{published}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="mt-5">
        <h5>{category}</h5>
        <Form className="mt-3 mb-3">
          <Button
            variant="light"
            size="sm"
            onClick={() => setCategory('All Genre')}
          >
            All
          </Button>
          <Row className="justify-content-md-start">
            {genres?.map(({ id, category }) => (
              <Col xs={2} key={id}>
                <Button
                  variant="light"
                  size="sm"
                  className="my-1"
                  value={category}
                  name={category}
                  onClick={onClick}
                >
                  {category}
                </Button>
              </Col>
            ))}
          </Row>
        </Form>
      </div>
    </Container>
  )
}

export default Books
