import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { Notification } from './components/Notification'

const App = () => {
  const [page, setPage] = useState('authors')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>
      <div>
        <Notification error={errorMessage} success={successMessage} />
      </div>

      <Authors
        show={page === 'authors'}
        setSuccessMessage={setSuccessMessage}
        setErrorMessage={setErrorMessage}
      />

      <Books show={page === 'books'} />

      <NewBook
        show={page === 'add'}
        setSuccessMessage={setSuccessMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  )
}

export default App
