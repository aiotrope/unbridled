import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../graphql/queries'
import Table from 'react-bootstrap/Table'
import Container from 'react-bootstrap/Container'
import pkg from 'lodash'
const { cloneDeep } = pkg

const Books = ({ mounted, setErrorMessage }) => {
  const [books, setBooks] = useState([])
  const { loading, error, data } = useQuery(ALL_BOOKS, {
    notifyOnNetworkStatusChange: true,
  })

  useEffect(() => {
    if (mounted && data?.allBooks) {
      setBooks(cloneDeep(data?.allBooks))
    }
  }, [data?.allBooks, mounted])

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

  if (loading) {
    return <p>loading...</p>
  }
  console.log(books)
  return (
    <Container className="wrapper">
      <h2>Books</h2>
      <Table striped>
        <thead>
          <tr>
            <th>Book</th>
            <th>Author</th>
            <th>Published</th>
          </tr>
        </thead>
        <tbody>
          {books.map(({ id, title, author, published }) => (
            <tr key={id}>
              <td>{title}</td>
              {author.map(({ id, name }) => (
                <td key={id}>{name}</td>
              ))}
              <td>{published}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  )
}

export default Books
