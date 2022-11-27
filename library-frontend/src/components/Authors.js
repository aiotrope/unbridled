import { useQuery, gql, NetworkStatus } from '@apollo/client'
import pkg from 'lodash'
const { cloneDeep } = pkg

const ALL_AUTHORS = gql`
  query AllAuthors {
    allAuthors {
      id
      name
      born
      bookCount
    }
  }
`

const Authors = (props) => {
  const { loading, error, data, networkStatus } = useQuery(ALL_AUTHORS, {
    notifyOnNetworkStatusChange: true,
   pollInterval: 500
  })

  if (!props.show) {
    return null
  }

  if (networkStatus === NetworkStatus.refetch) return 'Refetching!'

  if (loading) {
    return null
  }
  if (error) {
    return <p>Error: {error.message}</p>
  }

  const authors = cloneDeep(data.allAuthors)

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map(({ id, name, born, bookCount }) => (
            <tr key={id}>
              <td>{name}</td>
              <td>{born}</td>
              <td>{bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Authors
