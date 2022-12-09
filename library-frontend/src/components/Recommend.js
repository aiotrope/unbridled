import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { Navigate } from 'react-router-dom'
import { ALL_BOOKS } from '../graphql/queries'
import Table from 'react-bootstrap/Table'
import Container from 'react-bootstrap/Container'
import pkg from 'lodash'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const { cloneDeep, orderBy } = pkg

export const Recommend = ({ mounted, setErrorMessage, me, currentUser }) => {
  const [booksForUser, setBooksForUser] = useState([])
  const { loading, error } = useQuery(ALL_BOOKS)

  useEffect(() => {
    if (mounted && me?.favoriteGenre) {
      setBooksForUser(cloneDeep(me?.favoriteGenre))
    }
  }, [me?.favoriteGenre, mounted])

  useEffect(() => {
    if ((mounted && error) || (mounted && currentUser?.error)) {
      setErrorMessage(error?.message)
      setErrorMessage(currentUser?.error?.message)
      let timer
      timer = setTimeout(() => {
        setErrorMessage('')
        setErrorMessage('')
        clearTimeout(timer)
      }, 5000)
    }
  }, [currentUser?.error, error, mounted, setErrorMessage])

  const sorted = orderBy(booksForUser, ['published'], ['desc'])

  if (loading || currentUser.loading) {
    return <p>loading...</p>
  }

  if (me === null) {
    return <Navigate to={'/login'} />
  }

  return (
    <Container className="wrapper mb-5">
      <Row>
        <Col>
          <h2>Recommendation</h2>
          {sorted.map(({ id, category, books }) => (
            <div key={id} className="my-4">
              <h4>Books on your favorite genre {category}</h4>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Books</th>
                    <th>Author</th>
                    <th>Published</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(({ id, title, published, author }) => (
                    <tr key={id}>
                      <td>{title}</td>
                      <td>{author.name}</td>
                      <td>{published}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  )
}
