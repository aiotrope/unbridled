import React from 'react'

export const Notification = ({ error, success }) => {
  const ok = () => <div className="success">{success}</div>

  const notOk = () => <div className="error">{error}</div>

  const messageSuccess = () => {
    let timer = setTimeout(() => {
      ok()
    }, 10000)
    clearTimeout(timer)
  }

  const messageError = () => {
    let timer = setTimeout(() => {
      notOk()
    }, 10000)
    clearTimeout(timer)
  }

  if (error === null) {
    return null
  } else if (success === null) {
    return null
  } else if (success) {
    return messageSuccess()
  } else if (error) {
    return messageError()
  } else {
    return null
  }
}
