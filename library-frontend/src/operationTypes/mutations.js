import { gql } from '@apollo/client'

export const ADD_BOOK = gql`
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
      id
      title
      published
      genres
      author {
        bookCount
        name
        born
      }
    }
  }
`

export const EDIT_AUTHOR = gql`
  mutation editAuthor($editAuthorId: ID!, $bornInput: BornInput!) {
    editAuthor(id: $editAuthorId, bornInput: $bornInput) {
      id
      name
      born
      bookCount
    }
  }
`
