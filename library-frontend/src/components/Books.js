import { useQuery, NetworkStatus } from '@apollo/client'
import { ALL_BOOKS } from '../operationTypes/queries'
import pkg from 'lodash'
const { cloneDeep } = pkg


const Books = (props) => {
  const { loading, error, data, networkStatus } = useQuery(ALL_BOOKS, {
    notifyOnNetworkStatusChange: true
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

  const books = cloneDeep(data.allBooks)
  //console.log(books)
  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map(({ id, title, author, published }) => (
            <tr key={id}>
              <td>{title}</td>
              {author.map(({ id, name }) => (
                <td key={id}>{name}</td>
              ))}
              <td>{published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
