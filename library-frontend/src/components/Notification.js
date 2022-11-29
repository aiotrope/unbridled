import React from 'react'

export const Notification = ({ error, success }) => {
  const ok = () => (
    <div className="success mt-2 mb-2">
      <p>{success}</p>
    </div>
  )

  const notOk = () => (
    <div className="error mt-2 mb-2">
      <p>{error}</p>
    </div>
  )

  return success ? ok() : notOk()
}
