/* eslint-disable quotes */
import { jwt_key } from '../utils/config.js'
import { PubSub } from 'graphql-subscriptions'
import { GraphQLError } from 'graphql'
import User from '../models/user.js'
import Author from '../models/author.js'
import Book from '../models/book.js'
import Genre from '../models/genre.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import logger from '../utils/logger.js'
import mongoose from 'mongoose'
import pkg from 'lodash'

const pubsub = new PubSub()
const { countBy, filter, map, indexOf, includes } = pkg

export const resolvers = {
  Query: {
    allUsers: async () => {
      try {
        const users = await User.find({})
          .populate('favoriteGenre')
          .populate('bookEntries')
        if (users) return users
      } catch (error) {
        throw new GraphQLError("Can't processed allUsers request", {
          extensions: { code: 'BAD_REQUEST' },
        })
      }
    },
    me: async (parent, args, contextValue) => {
      const currentUser = contextValue.currentUser
      try {
        if (!currentUser) {
          throw new GraphQLError('User not authenticated', {
            extensions: { code: 'UNAUTHENTICATED' },
            http: { status: 401 },
          })
        }
        return currentUser
      } catch (error) {
        throw new GraphQLError('User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
          http: { status: 401 },
        })
      }
    },
    authorCount: async () => {
      try {
        const count = await Author.countDocuments()
        if (count) return count
      } catch (error) {
        throw new GraphQLError("Can't processed authorCount request", {
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
        throw new GraphQLError("Can't processed bookCount request", {
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
        throw new GraphQLError("Can't processed allAuthors request", {
          extensions: { code: 'BAD_REQUEST' },
        })
      }
    },
    allBooks: async (parent, args) => {
      try {
        const books = await Book.find({})
          .populate('author', { id: 1, name: 1, born: 1, booksCollection: 1 })
          .populate('user', { id: 1, username: 1, favoriteGenre: 1 })
          .populate('genres', { id: 1, category: 1, books: 1 })
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
          const genre = await Genre.find({})
            .populate('category')
            .populate('books', {
              id: 1,
              title: 1,
              published: 1,
              author: 1,
              user: 1,
              genres: 1,
            })
          const genreIds = map(genre, 'category')
          const index = indexOf(genreIds, args.genre, 0)
          const findBooksByGenre = await Book.find({ genres: genre[index] })
            .populate('genres', { id: 1, category: 1, books: 1 })
            .populate('author', { id: 1, name: 1 })

          return findBooksByGenre
        } else {
          return books
        }
      } catch (error) {
        throw new GraphQLError("Can't processed allBooks request", {
          extensions: { code: 'BAD_REQUEST' },
        })
      }
    },
    allGenres: async () => {
      try {
        const genres = await Genre.find({}).populate('books', {
          id: 1,
          title: 1,
          genres: 1,
          user: 1,
          author: 1,
          published: 1,
        })
        if (genres) return genres
      } catch (error) {
        throw new GraphQLError("Can't processed allGenres request", {
          extensions: { code: 'BAD_REQUEST' },
        })
      }
    },
  },
  Mutation: {
    createUser: async (parent, args) => {
      const duplicateUsername = await User.findOne({
        username: args.createUserInput.username,
      })
      const regexPass =
        /^[a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-{}???"'????????????`~_]{3,}$/gm
      const regexUser =
        /^[a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-{}???"'????????????`~_]{5,}$/gm
      const testPassword = regexPass.test(args.createUserInput.password)
      const testUsername = regexUser.test(args.createUserInput.username)

      if (args.createUserInput.username.length < 5 && !testUsername) {
        throw new GraphQLError(
          `${args.createUserInput.username} invalid! Must be at least 5 characters upper/lower case, numbers and special characters are allowed.`,
          { extensions: { code: 'BAD_USER_INPUT', argumentName: 'username' } }
        )
      } else if (args.createUserInput.password.length < 3 && !testPassword) {
        throw new GraphQLError(
          `${args.createUserInput.password} invalid! Password must be at least 3 characters in length.`,
          { extensions: { code: 'BAD_USER_INPUT', argumentName: 'password' } }
        )
      } else if (duplicateUsername) {
        throw new GraphQLError(
          `${args.createUserInput.username} invalid! The username you entered is already been taken.`,
          { extensions: { code: 'BAD_USER_INPUT', argumentName: 'username' } }
        )
      } else if (args.createUserInput.favoriteGenre.length < 1) {
        throw new GraphQLError(
          `Invalid! Must choose at least one preferred genre!`,
          {
            extensions: {
              code: 'BAD_USER_INPUT',
              argumentName: 'favoriteGenre',
            },
          }
        )
      } else {
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(
          args.createUserInput.password,
          saltRounds
        )
        const user = new User({
          username: args.createUserInput.username,
          passwordHash: passwordHash,
          favoriteGenre: args.createUserInput.favoriteGenre,
        })

        try {
          const newUser = await User.create(user)

          if (newUser) {
            const response = {
              id: newUser.id,
              username: newUser.username,
              favoriteGenre: newUser.favoriteGenre,
              successSignupMessage: `${newUser.username} signup successful!`,
            }
            for (let item of args.createUserInput.favoriteGenre) {
              const genre = await Genre.findById(item)
              genre.users = genre.users.concat(newUser._id)
              await genre.save()
            }

            return response
          }
        } catch (error) {
          //logger.error(error)
          throw new GraphQLError(
            "Can't processed createUser request due to some internal issues.",
            { extensions: { code: 'BAD_REQUEST' } }
          )
        }
      }
    },
    login: async (parent, args) => {
      const user = await User.findOne({ username: args.username })
      const passwordVerified = await bcrypt.compare(
        args.password,
        user.passwordHash
      )
      const regexPass =
        /^[a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-{}???"'????????????`~_]{3,}$/gm
      const regexUser =
        /^[a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-{}???"'????????????`~_]{5,}$/gm
      const testPassword = regexPass.test(args.password)
      const testUsername = regexUser.test(args.username)
      if (args.username.length < 5 || !testUsername) {
        throw new GraphQLError(
          'Invalid! Check if you entered your correct username or password',
          { extensions: { code: 'BAD_USER_INPUT', argumentName: 'username' } }
        )
      } else if (args.password.length < 3 || !testPassword) {
        throw new GraphQLError(
          'Invalid! Check if you entered your correct username or password',
          { extensions: { code: 'BAD_USER_INPUT', argumentName: 'password' } }
        )
      } else if (!user || !passwordVerified) {
        throw new GraphQLError(
          'Wrong credentials! Check if you entered your correct username or password',
          { extensions: { code: 'BAD_USER_INPUT' } }
        )
      } else if (user && passwordVerified) {
        try {
          const userToken = {
            username: user.username,
            id: user._id,
          }
          const token = jwt.sign(userToken, jwt_key, { expiresIn: '1h' })
          const decode = jwt.decode(token, jwt_key)
          const userId = decode.id
          const loginUsername = user.username
          const msg = `Welcome back ${loginUsername}`

          return {
            token: token,
            id: userId,
            username: loginUsername,
            successLoginMessage: msg,
          }
        } catch (error) {
          throw new GraphQLError("Can't processed login request", {
            extensions: { code: 'BAD_REQUEST' },
          })
        }
      } else {
        throw new GraphQLError("Can't processed login request", {
          extensions: { code: 'BAD_REQUEST' },
        })
      }
    },
    addAuthor: async (root, args) => {
      try {
        let author = new Author(args.authorInput)
        const newAuthor = await Author.create(author)
        if (newAuthor) {
          return newAuthor
        }
      } catch (error) {
        throw new GraphQLError("Can't processed addAuthor request", {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
    },
    addBook: async (parent, args, contextValue) => {
      const currentUser = contextValue.currentUser
      const authors = await Author.find({})
      const books = await Book.find({})
      const filter = books.filter((book) =>
        book.title.toUpperCase().includes(args.title.toUpperCase())
      )

      const author = authors.map((a) => a.id)
      if (args.title.length < 5) {
        throw new GraphQLError(
          'Invalid! Title must be at least 5 characters in length',
          {
            extensions: { code: 'BAD_USER_INPUT', argumentName: 'title' },
          }
        )
      } else if (!author.includes(args.author)) {
        throw new GraphQLError(
          `Invalid! No author with this name (${args.author}) found!`,
          {
            extensions: { code: 'BAD_USER_INPUT', argumentName: 'author' },
          }
        )
      } else if (args.author.length < 1) {
        throw new GraphQLError(
          `Invalid! Please provide author for the book entry!`,
          {
            extensions: { code: 'BAD_USER_INPUT', argumentName: 'author' },
          }
        )
      } else if (!args.published) {
        throw new GraphQLError(
          `Invalid! Please provide publication year for the book entry!`,
          {
            extensions: { code: 'BAD_USER_INPUT', argumentName: 'published' },
          }
        )
      } else if (args.genres.length < 1) {
        throw new GraphQLError(
          `Invalid! Select at least on genre category for book entry!`,
          {
            extensions: { code: 'BAD_USER_INPUT', argumentName: 'genres' },
          }
        )
      } else if (filter.length > 0) {
        throw new GraphQLError(
          `${args.title} invalid! your title entry is not unique!`,
          { extensions: { code: 'BAD_USER_INPUT', argumentName: 'title' } }
        )
      } else if (!contextValue.currentUser) {
        throw new GraphQLError('User is not authenticated!', {
          extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
        })
      } else {
        try {
          let book = new Book({
            ...args,
            user: mongoose.Types.ObjectId(currentUser.id),
          })
          const newBook = await Book.create(book)

          if (newBook) {
            currentUser.bookEntries = currentUser.bookEntries.concat(newBook)
            await currentUser.save()

            for (let item of args.genres) {
              const genre = await Genre.findById(item)
              genre.books = genre.books.concat(newBook)
              await genre.save()
            }

            const author = await Author.findById(args.author)
            author.books = author.books.concat(newBook)
            await author.save()

            const response = {
              id: book.id,
              title: book.title,
              published: book.published,
              author: book.author,
              genres: book.genres,
            }

            pubsub.publish('BOOK_ADDED', { bookAdded: response })

            return response
          } else {
            throw new GraphQLError("Can't processed AddBook request", {
              extensions: { code: 'BAD_REQUEST' },
            })
          }
        } catch (error) {
          if (error) {
            logger.error(error.extensions?.code)
          }
          throw new GraphQLError("Can't processed AddBook request", {
            extensions: { code: 'BAD_REQUEST' },
          })
        }
      }
    },
    addGenre: async (parent, args) => {
      const valid = /^[a-zA-Z\s-]{4,}?$/gm.test(args.genreInput.category)
      const duplicateGenre = await Genre.findOne({
        category: args.genreInput.category,
      })

      const genres = await Genre.find({})
      const filter = genres.filter((genre) =>
        genre.category
          .toUpperCase()
          .includes(args.genreInput.category.toUpperCase())
      )
      if (args.genreInput.category.length < 4) {
        throw new GraphQLError(
          `${args.genreInput.category} invalid! Category must be at least 4 characters in length`,
          { extensions: { code: 'BAD_USER_INPUT', argumentName: 'category' } }
        )
      } else if (!valid) {
        throw new GraphQLError(
          `${args.genreInput.category} invalid! Category only accepts alphabetic characters, whitespace and dash`,
          { extensions: { code: 'BAD_USER_INPUT', argumentName: 'category' } }
        )
      } else if (duplicateGenre || filter.length > 0) {
        throw new GraphQLError(
          `${args.genreInput.category} invalid! your genre entry is not unique!`,
          { extensions: { code: 'BAD_USER_INPUT', argumentName: 'category' } }
        )
      } else {
        const userInput = { category: args.genreInput.category }
        try {
          let genre = new Genre(userInput)
          const newGenre = await Genre.create(genre)
          if (newGenre) return newGenre
        } catch (error) {
          throw new GraphQLError(
            `${args.genreInput.category} invalid! Category only accepts alphabetic characters, whitespace and dash`,
            { extensions: { code: 'BAD_USER_INPUT', argumentName: 'category' } }
          )
        }
      }
    },

    editAuthor: async (parent, args, contextValue) => {
      const authorAtStart = await Author.findById(args.id)
      if (!contextValue.currentUser) {
        throw new GraphQLError('User is not authenticated!', {
          extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
        })
      } else if (!args.bornInput) {
        throw new GraphQLError("Provide update for author's year of birth", {
          extensions: { code: 'BAD_USER_INPUT', argumentName: 'born' },
        })
      } else {
        try {
          const author = await Author.findByIdAndUpdate(
            args.id,
            args.bornInput,
            {
              new: true,
            }
          )
          if (author) {
            const msg = `${author.name} year of birth updated from ${authorAtStart.born} to ${author.born}`
            const response = {
              id: author.id,
              name: author.name,
              born: author.born,
              successEditAuthorMessage: msg,
            }
            return response
          } else {
            throw new GraphQLError("Can't processed editAuthor request", {
              extensions: { code: 'BAD_REQUEST' },
            })
          }
        } catch (error) {
          throw new GraphQLError("Can't processed editAuthor request", {
            extensions: { code: 'BAD_REQUEST' },
          })
        }
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
        throw new GraphQLError("Can't processed bookCount for Author request", {
          extensions: { code: 'BAD_REQUEST' },
        })
      }
    },
  },
  User: {
    favoriteGenre: async (parent, __, contextValue) => {
      const currentUser = contextValue.currentUser
      if (!currentUser) {
        throw new GraphQLError('User is not authenticated!', {
          extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
        })
      } else {
        const favorite = map(parent.favoriteGenre, 'id')
        const genres = await Genre.find({}).populate('books')
        const booksByGenreRecommendation = filter(genres, (val) =>
          includes(favorite, val.id)
        )
        return booksByGenreRecommendation
      }
    },
  },
  Book: {
    author: async (parent) => {
      const author = await Author.findById(parent.author)
      return author
    },
    genres: async (parent) => {
      const mapBookGenre = map(parent.genres, 'id')
      const genres = await Genre.find({}).populate('books')
      const filteredGenres = filter(genres, (val) =>
        includes(mapBookGenre, val.id)
      )
      return filteredGenres
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
}
