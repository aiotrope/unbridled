import { gql } from '@apollo/client'

export const ADD_BOOK = gql`
  mutation addBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [ID!]!
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
      successAddBookMessage
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
      successEditAuthorMessage
    }
  }
`

export const CREATE_USER = gql`
  mutation createUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      id
      username
      successSignupMessage
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      username
      token
      successLoginMessage
    }
  }
`
