import React, { useState, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

//import Books from './components/Books'
//import NewBook from './components/NewBook'
import { Notification } from './components/Notification'
import { Menu } from './components/Menu'
import Authors from './components/Authors'
import { Signup } from './components/Signup'
import { Login } from './components/Login'
import { NotFound } from './components/NotFound'
import Container from 'react-bootstrap/Container'

import './_App.scss'

const App = () => {
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [authUsername, setAuthUsername] = useState(null)
  const isComponentMounted = useRef(true)

  useEffect(() => {
    return () => {
      isComponentMounted.current = false
    }
  }, [])

  useEffect(() => {
    const authUserState = async () => {
      if (isComponentMounted) {
        try {
          const user = JSON.parse(localStorage.getItem('user'))
          if (user !== null) {
            setAuthUsername(user.username)
          }
        } catch (error) {
          console.log(error)
        }
      }
    }
    authUserState()
  }, [])

  return (
    /*  <div>
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
        setPage={setPage}
        page={page}
      />
    </div> */
    <Router>
      <header>
        <Menu authUser={authUsername} setAuthUsername={setAuthUsername} />
      </header>
      <Container style={{ width: '48%' }}>
        <Notification error={errorMessage} success={successMessage} />
      </Container>

      <Container>
        <main className="mt-5">
          <Routes>
            <Route path="/" element={<Authors />} />
            <Route
              path="/signup"
              element={
                <Signup
                  mounted={isComponentMounted}
                  setSuccessMessage={setSuccessMessage}
                  setErrorMessage={setErrorMessage}
                  authUser={authUsername}
                />
              }
            />
            <Route
              path="/login"
              element={
                <Login
                  mounted={isComponentMounted}
                  setSuccessMessage={setSuccessMessage}
                  setErrorMessage={setErrorMessage}
                  authUser={authUsername}
                />
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Container>
    </Router>
  )
}

export default App
