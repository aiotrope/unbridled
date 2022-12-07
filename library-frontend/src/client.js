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
