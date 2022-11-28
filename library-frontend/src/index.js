import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import App from './App'
import { defaultOptions } from './operationTypes/defaultOptions'

const baseUri = process.env.REACT_APP_BASE_URI

const client = new ApolloClient({
  uri: baseUri,
  cache: new InMemoryCache(),
  name: 'library-frontend',
  queryDeduplication: false,
  defaultOptions: defaultOptions,
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
)
