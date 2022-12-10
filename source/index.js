import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import express from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import User from './models/user.js'
import { jwt_key } from './utils/config.js'
import { port } from './utils/config.js'
import { typeDefs } from './schema/typeDefs.js'
import { resolvers } from './schema/resolvers.js'
import MongoDatabase from './utils/database.js'
import logger from './utils/logger.js'

MongoDatabase()

const start = async () => {
  const app = express()

  const httpServer = http.createServer(app)

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  })

  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),

      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

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
            .populate('favoriteGenre')
            .populate('bookEntries')

          return { currentUser }
        }
      },
    })
  )

  httpServer.listen(port, () => {
    logger.info(`🚀 Server ready at http://localhost:${port}/`)
  })
}

start()
