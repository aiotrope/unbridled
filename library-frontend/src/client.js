import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { defaultOptions } from './graphql/defaultOptions'

const baseUri = process.env.REACT_APP_BASE_URI

const httpLink = new HttpLink({
  uri: baseUri,
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
  connectToDevTools: true,
  name: 'library-frontend',
  queryDeduplication: false,
  defaultOptions: defaultOptions,
})
export default client

/* import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getMainDefinition } from '@apollo/client/utilities'
import { defaultOptions } from './graphql/defaultOptions'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'

const baseUri = process.env.REACT_APP_BASE_URI
const wsBaseUri = process.env.REACT_APP_WS_BASE_URI

const httpLink = new HttpLink({
  uri: baseUri,
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: wsBaseUri,
  })
)

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
  connectToDevTools: true,
  name: 'library-frontend',
  queryDeduplication: false,
  defaultOptions: defaultOptions,
})

export default client
 */