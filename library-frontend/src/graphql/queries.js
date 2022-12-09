import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
  query AllAuthors {
    allAuthors {
      id
      name
      born
      bookCount
    }
  }
`
export const ALL_BOOKS = gql`
  query AllBooks($genre: String) {
    allBooks(genre: $genre) {
      id
      title
      published
      author {
        id
        name
      }
      genres {
        id
        category
      }
    }
  }
`

export const ALL_GENRES = gql`
  query AllGenres {
    allGenres {
      id
      category
      books {
        id
        title
      }
    }
  }
`

export const ME = gql`
  query Me {
    me {
      id
      username
      favoriteGenre {
        id
        category
        books {
          id
          title
          published
          author {
            id
            name
            born
            bookCount
          }
        }
      }
    }
  }
`
