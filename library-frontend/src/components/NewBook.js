import { useState } from 'react'
import { useMutation, useQuery, makeVar, useReactiveVar } from '@apollo/client'
import { ADD_BOOK } from '../operationTypes/mutations'
import { ALL_AUTHORS, ALL_BOOKS } from '../operationTypes/queries'

const booksVar = makeVar([])

const NewBook = (props) => {
  
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [addBook, { data, loading, error, reset }] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }],
  })
  const authorQuery = useQuery(ALL_AUTHORS)

  const booksItem = useReactiveVar(booksVar)


  
  if (!props.show) {
    return null
  }

  if (error) {
    
    return <p>Error: {error.message}</p>
  }

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

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
    reset()
   /*  const sample = authorQuery?.data?.allAuthors
    booksVar([...sample, data.addBook]) */
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }
 
  return (
    <div>
      <form onSubmit={submit} spellCheck="false">
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          <label htmlFor="author">author</label>
          <select
            name="author"
            onChange={({ target }) => setAuthor(target.value)}
          >
            <option label="-- select an option --"></option>
            {authorQuery.data.allAuthors.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          published
          <input
            type="number"
            name="published"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook
