import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { defaultOptions } from './graphql/defaultOptions'

const baseUri = process.env.REACT_APP_BASE_URI

const client = new ApolloClient({
  link: new HttpLink({
    uri: baseUri,
  }),
  cache: new InMemoryCache(),
  connectToDevTools: true,
  name: 'library-frontend',
  queryDeduplication: false,
  defaultOptions: defaultOptions,
})
export default client
