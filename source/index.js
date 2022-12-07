import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
//import { ApolloServerErrorCode } from '@apollo/server/errors'
import express from 'express'
import http from 'http'
import MongoDatabase from './utils/database.js'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import { typeDefs } from './schema/typeDefs.js'
import { resolvers } from './schema/resolvers.js'
import logger from './utils/logger.js'
import { port } from './utils/config.js'
import { jwt_key } from './utils/config.js'
import jwt from 'jsonwebtoken'
import User from './models/user.js'

const app = express()

MongoDatabase()

const httpServer = http.createServer(app)

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
})

const start = async () => {
  await server.start()

  app.use(
    '/graphql',
    cors(),
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.toLowerCase().startsWith('bearer')) {
          const decodedToken = jwt.verify(auth.substring(7), jwt_key)
          const currentUser = await User.findById(decodedToken.id)
            .populate('favoriteGenre', { id: 1, category: 1, books: 1 })
            .populate('books', {
              id: 1,
              title: 1,
              user: 1,
              author: 1,
              genres: 1,
              published: 1
            })

          return { currentUser }
        }
      },
    })
  )

  await new Promise((resolve) => httpServer.listen({ port: port }, resolve))

  logger.info(`🚀 Server ready at http://localhost:${port}/`)
}

start()
