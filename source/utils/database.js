import { environment } from './config.js'
import mongoose from 'mongoose'
import logger from './logger.js'

const MongoDatabase = () => {
  const env = process.env.NODE_ENV || 'development'

  let dbURL = environment[env].dbString

  const opts = {
    autoIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }

  mongoose.connect(dbURL, opts)

  const db = mongoose.connection
  db.once('open', () => {
    logger.debug(`Database connected: ${dbURL}`)
  })

  db.on('error', (error) => {
    logger.error(`connection error: ${error}`)
  })
}

export default MongoDatabase
