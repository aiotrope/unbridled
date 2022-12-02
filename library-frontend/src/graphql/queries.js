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
  query AllBooks {
    allBooks {
      id
      title
      published
      author {
        id
        name
        born
      }
      genres
    }
  }
`

export const ALL_GENRES = gql`
  query AllGenres {
    allGenres {
      id
      category
    }
  }
`
