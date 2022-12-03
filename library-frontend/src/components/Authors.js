import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS } from '../graphql/queries'
import { EDIT_AUTHOR } from '../graphql/mutations'
import Table from 'react-bootstrap/Table'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import pkg from 'lodash'
const { cloneDeep } = pkg

const Authors = ({ mounted, setSuccessMessage, setErrorMessage, authUser }) => {
  const [author, setAuthor] = useState(null)
  const [born, setBorn] = useState(null)

  const authorQuery = useQuery(ALL_AUTHORS, {
    notifyOnNetworkStatusChange: true,
  })

  const [editAuthor, { loading, error, data }] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  useEffect(() => {
    if (mounted && data?.editAuthor) {
      setSuccessMessage(data?.editAuthor?.successEditAuthorMessage)
      let timer
      timer = setTimeout(() => {
        setSuccessMessage('')
        setAuthor('')
        setBorn('')
        clearTimeout(timer)
      }, 4000)
    }
  }, [data?.editAuthor, mounted, setSuccessMessage])

  useEffect(() => {
    if (mounted && error) {
      setErrorMessage(error?.message)
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
  }, [authorQuery.error, mounted, setErrorMessage])

  const authors = cloneDeep(authorQuery?.data?.allAuthors)

  const submit = (event) => {
    event.preventDefault()

    editAuthor({
      variables: {
        editAuthorId: author,
        bornInput: { born: born },
      },
    })
    setAuthor('')
    setBorn('')
  }

  if (authorQuery.loading || loading) {
    return <p>loading...</p>
  }

  return (
    <Container className="wrapper">
      <h2>Authors</h2>
      <Table responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Born</th>
            <th>Books</th>
          </tr>
        </thead>
        <tbody>
          {authors.map(({ id, name, born, bookCount }) => (
            <tr key={id}>
              <td>{name}</td>
              <td>{born}</td>
              <td>{bookCount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {authUser ? (
        <div className="mt-5" style={{ width: '40%' }}>
          <h3>Set Birthyear</h3>
          <Form spellCheck="false" onSubmit={submit}>
            <Form.Group className="mb-3 mt-3">
              <Form.Label htmlFor="author">Name</Form.Label>
              <Form.Select
                name="author"
                onChange={({ target }) => setAuthor(target.value)}
              >
                <option>-- select an option --</option>
                {authors.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="born">
              <Form.Label>Born</Form.Label>
              <Form.Control
                placeholder="Author's year of birth"
                type="text"
                onChange={({ target }) => setBorn(Number(target.value))}
              />
            </Form.Group>
            <Form.Group className="mt-4">
              <Button
                type="submit"
                variant="outline-secondary"
                className="btn-lg btn-block"
              >
                Update Author
              </Button>
            </Form.Group>
          </Form>
        </div>
      ) : null}
    </Container>
  )
}

export default Authors
