import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
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
    expressMiddleware(server)
  )

  await new Promise((resolve) => httpServer.listen({ port: port }, resolve))

  logger.info(`🚀 Server ready at http://localhost:${port}/`)
}

start()
