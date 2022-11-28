import React, { useState } from 'react'
import { useQuery, NetworkStatus, useMutation } from '@apollo/client'
import { ALL_AUTHORS } from '../operationTypes/queries'
import { EDIT_AUTHOR } from '../operationTypes/mutations'
import pkg from 'lodash'
const { cloneDeep } = pkg

const Authors = (props) => {
  const [author, setAuthor] = useState(null)
  const [born, setBorn] = useState(null)

  const authorQuery = useQuery(ALL_AUTHORS, {
    notifyOnNetworkStatusChange: true,
  })

  const [editAuthor, result] = useMutation(EDIT_AUTHOR, {
    notifyOnNetworkStatusChange: true,
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  if (!props.show) {
    return null
  }

  if (authorQuery.networkStatus === NetworkStatus.refetch) return 'Refetching!'

  if (authorQuery.loading) {
    return <p>loading...</p>
  }

  if (authorQuery.error) {
    return <p>Error: {authorQuery.error.message}</p>
  }

  const authors = cloneDeep(authorQuery.data.allAuthors)

  const handleSubmit = (event) => {
    event.preventDefault()
    
    editAuthor({
      variables: {
        editAuthorId: author,
        bornInput: { "born": born }
      },
    })
    setAuthor(null)
    setBorn(null)
  }
  console.log(result?.data)
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map(({ id, name, born, bookCount }) => (
            <tr key={id}>
              <td>{name}</td>
              <td>{born}</td>
              <td>{bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h3>set birthyear</h3>
        <form spellCheck="false" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="author">name</label>
            <select
              name="author"
              onChange={({ target }) => setAuthor(target.value)}
            >
              <option label="-- select an option --"></option>
              {authors.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="born">born</label>
            <input
              type="text"
              onChange={({ target }) => setBorn(Number(target.value))}
            />
          </div>
          <button type="submit">update author</button>
        </form>
      </div>
    </div>
  )
}

export default Authors
