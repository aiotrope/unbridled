import React from 'react'
import Container from 'react-bootstrap/Container'
import Alert from 'react-bootstrap/Alert'

export const Notification = ({ error, success, mounted }) => {
  
  return (
    <div className="mt-5">
      {success ? <Alert variant="success">{success}</Alert> : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}
    </div>
  )
}
