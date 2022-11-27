import morgan from 'morgan'
import logger from './logger.js'

const stream = {
  write: (message) => logger.http(message),
}

const skip = () => {
  const env = process.env.NODE_ENV || 'development'
  return env !== 'development'
}

const loggingMiddleware = (req, res, next) => {
  morgan(
    ':remote-addr :method :url :status :res[content-length] - :response-time ms',

    { stream, skip }
  )
  next()
}

const middleware = {
  loggingMiddleware,
}

export default middleware
