/* eslint-disable quotes */
import Author from '../models/author.js'
import Book from '../models/book.js'
import logger from '../utils/logger.js'
import pkg from 'lodash'
import { GraphQLError } from 'graphql'

const { countBy, filter } = pkg

export const resolvers = {
  Query: {
    authorCount: async () => {
      try {
        const count = await Author.countDocuments()
        if (count) return count
      } catch (error) {
        throw new GraphQLError("can't processed authorCount request", {
          extensions: { code: 'BAD_REQUEST' },
        })
      }
    },
    bookCount: async () => {
      try {
        const count = await Book.countDocuments()
        if (count) return count
      } catch (error) {
        logger.error(error.extensions?.code)
        throw new GraphQLError("can't processed bookCount request", {
          extensions: { code: 'BAD_REQUEST' },
        })
      }
    },

    allAuthors: async () => {
      try {
        const authors = await Author.find({})
        if (authors) {
          return authors
        }
      } catch (error) {
        throw new GraphQLError("can't processed allAuthors request", {
          extensions: { code: 'BAD_REQUEST' },
        })
      }
    },
    allBooks: async (parent, args) => {
      try {
        const books = await Book.find({}).populate('author', { name: 1 })
        let response
        if (args.author) {
          response = filter(books, function (book) {
            return book.author[0]['name']
              .toUpperCase()
              .includes(args.author.toUpperCase())
          })

          return response
        } else if (args.authorId) {
          response = filter(books, function (book) {
            return book.author[0]['id'].includes(args.authorId)
          })

          return response
        } else if (args.genre) {
          response = filter(books, function (x) {
            return x.genres.includes(args.genre)
          })
          return response
        } else {
          return books
        }
      } catch (error) {
        throw new GraphQLError("can't processed allBooks request", {
          extensions: { code: 'BAD_REQUEST' },
        })
      }
    },
  },
  Mutation: {
    addAuthor: async (root, args) => {
      try {
        let author = new Author(args.authorInput)
        const newAuthor = await Author.create(author)
        if (newAuthor) {
          return newAuthor
        }
      } catch (error) {
        throw new GraphQLError("can't processed addAuthor request", {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
    },
    addBook: async (parent, args) => {
      try {
        const userInput = { ...args }
        let book = new Book(userInput)
        const newBook = await Book.create(book)
        if (newBook) {
          return newBook
        }
      } catch (error) {
        if (error) {
          logger.error(error.extensions?.code)
        }

        throw new GraphQLError("can't processed addBook request", {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
    },
    editAuthor: async (parent, args) => {
      try {
        const author = await Author.findByIdAndUpdate(args.id, args.bornInput, {
          new: true,
        })
        if (author) {
          return author
        }
      } catch (error) {
        throw new GraphQLError("can't processed editAuthor request", {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
    },
  },
  Author: {
    bookCount: async (parent) => {
      try {
        const books = await Book.find({})
        const authorNames = countBy(books, 'author')
        const booksByAuthor = authorNames[parent.id]
        if (booksByAuthor) return booksByAuthor
      } catch (error) {
        logger.error(error.extensions?.code)
        throw new GraphQLError("can't processed bookCount for Author request", {
          extensions: { code: 'BAD_REQUEST' },
        })
      }
    },
  },
}
