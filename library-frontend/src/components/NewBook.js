import { useState } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'

const ADD_BOOK = gql`
  mutation addBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String]!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      title
      id
      published
      genres
    }
  }
`

const ALL_AUTHORS = gql`
  query AllAuthors {
    allAuthors {
      id
      name
      born
    }
  }
`
const ALL_BOOKS = gql`
  query AllBooks {
    allBooks {
      id
      title
      published
      author {
        name
        id
        born
      }
      genres
    }
  }
`
const NewBook = (props) => {
  const [addBook, { data, loading, error }] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }],
  })
  const authorQuery = useQuery(ALL_AUTHORS)

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  if (!props.show) {
    return null
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  const submit = async (event) => {
    event.preventDefault()
    const _pub = Number(event.target.published.value)
    //console.log(event.target.author.value)
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
    //window.location.reload()
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }
  console.log(data)
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
