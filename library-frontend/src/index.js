import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
} from '@apollo/client'

const baseUri = process.env.REACT_APP_BASE_URI

const client = new ApolloClient({
  uri: baseUri,
  cache: new InMemoryCache(),
})

client.query({
  query: gql`
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
  `,
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
)
