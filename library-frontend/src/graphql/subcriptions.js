import { gql } from '@apollo/client'

export const BOOK_ADDED = gql`
  subscription bookAdded {
    bookAdded {
      id
      title
      published
    }
  }
`
