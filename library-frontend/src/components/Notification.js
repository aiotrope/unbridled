import React from 'react'
import Alert from 'react-bootstrap/Alert'

export const Notification = ({ error, success, info }) => {
  return (
    <div className="mt-5">
      {success ? <Alert variant="success">{success}</Alert> : null}
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {info ? <Alert variant="primary">{info}</Alert> : null}
    </div>
  )
}
