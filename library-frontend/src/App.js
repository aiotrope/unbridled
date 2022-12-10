import React, { useState, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { Notification } from './components/Notification'
import { Menu } from './components/Menu'
import Authors from './components/Authors'
import { Signup } from './components/Signup'
import { Login } from './components/Login'
import { Recommend } from './components/Recommend'
import { NotFound } from './components/NotFound'
import Container from 'react-bootstrap/Container'
import { ME } from './graphql/queries'
import './_App.scss'

const App = () => {
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [me, setMe] = useState(null)
  const [token, setToken] = useState(null)
  const isComponentMounted = useRef(true)

  const currentUser = useQuery(ME)

  useEffect(() => {
    return () => {
      isComponentMounted.current = false
    }
  }, [])

  useEffect(() => {
    const setAuthUserState = async () => {
      if (isComponentMounted) {
        try {
          const token = localStorage.getItem('token')
          if (token !== null) {
            setToken(token)
            setMe(currentUser?.data?.me)
          }
        } catch (error) {
          console.log(error)
        }
      }
    }
    setAuthUserState()
  }, [currentUser?.data?.me])

  return (
    <Router>
      <header>
        <Menu token={token} setToken={setToken} me={me} setMe={setMe} />
      </header>
      <Container style={{ width: '48%' }}>
        <Notification error={errorMessage} success={successMessage} info={infoMessage}/>
      </Container>

      <Container>
        <main style={{ marginTop: '6rem' }}>
          <Routes>
            <Route
              path="/"
              element={
                <Authors
                  mounted={isComponentMounted}
                  setSuccessMessage={setSuccessMessage}
                  setErrorMessage={setErrorMessage}
                  me={me}
                />
              }
            />
            <Route
              path="/signup"
              element={
                <Signup
                  mounted={isComponentMounted}
                  setSuccessMessage={setSuccessMessage}
                  setErrorMessage={setErrorMessage}
                  me={me}
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
                  me={me}
                  setToken={setToken}
                />
              }
            />
            <Route
              path="/books"
              element={
                <Books
                  mounted={isComponentMounted}
                  setErrorMessage={setErrorMessage}
                  setInfoMessage={setInfoMessage}
                />
              }
            />
            <Route
              path="/add"
              element={
                <NewBook
                  mounted={isComponentMounted}
                  setSuccessMessage={setSuccessMessage}
                  setErrorMessage={setErrorMessage}
                  me={me}
                />
              }
            />
            <Route
              path="/recommend"
              element={
                <Recommend
                  mounted={isComponentMounted}
                  setErrorMessage={setErrorMessage}
                  me={me}
                  currentUser={currentUser}
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
