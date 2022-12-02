/* eslint-disable quotes */
import { jwt_key } from '../utils/config.js'
import { GraphQLError } from 'graphql'
import User from '../models/user.js'
import Author from '../models/author.js'
import Book from '../models/book.js'
import Genre from '../models/genre.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import logger from '../utils/logger.js'
import pkg, { isNull } from 'lodash'

const { countBy, filter } = pkg

export const resolvers = {
  Query: {
    allUsers: async () => {
      try {
        const users = await User.find({})
          .populate('favoriteGenre', {
            id: 1,
            category: 1,
          })
          .populate('books', { title: 1 })
        if (users) return users
      } catch (error) {
        throw new GraphQLError("Can't processed allUsers request", {
          extensions: { code: 'BAD_REQUEST' },
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
        throw new GraphQLError("Can't processed allBooks request", {
          extensions: { code: 'BAD_REQUEST' },
        })
      }
    },
    allGenres: async () => {
      try {
        const genres = await Genre.find({})
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
        /^[a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-{}€"'ÄöäÖØÆ`~_]{3,}$/gm
      const regexUser =
        /^[a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-{}€"'ÄöäÖØÆ`~_]{5,}$/gm
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
            return response
          }
        } catch (error) {
          throw new GraphQLError(
            "Can't processed createUser request due to some internal issues",
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
        /^[a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-{}€"'ÄöäÖØÆ`~_]{3,}$/gm
      const regexUser =
        /^[a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-{}€"'ÄöäÖØÆ`~_]{5,}$/gm
      const testPassword = regexPass.test(args.password)
      const testUsername = regexUser.test(args.username)
      if (args.username.length < 5 && !testUsername) {
        throw new GraphQLError(
          'Invalid! Check if you entered your correct username or password',
          { extensions: { code: 'BAD_USER_INPUT', argumentName: 'username' } }
        )
      } else if (args.password.length < 3 && !testPassword) {
        throw new GraphQLError(
          'Invalid! Check if you entered your correct username or password',
          { extensions: { code: 'BAD_USER_INPUT', argumentName: 'password' } }
        )
      } else if (!user || !passwordVerified) {
        throw new GraphQLError(
          'Wrong credentials! Check if you entered your correct username or password',
          { extensions: { code: 'BAD_USER_INPUT' } }
        )
      } else {
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
          //logger.http(user.username)
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
    addBook: async (parent, args) => {
      const authors = await Author.find({})
      const author = authors.map((a) => a.id)
      if (args.title.length < 5) {
        throw new GraphQLError(
          'Invalid! Title must be at least 5 characters in length',
          {
            extensions: { code: 'BAD_USER_INPUT', argumentName: 'title' },
          }
        )
      } else if (!author.includes(args.author)) {
        throw new GraphQLError(`Invalid! ${args.author} not found!`, {
          extensions: { code: 'BAD_USER_INPUT', argumentName: 'author' },
        })
      } else {
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

          throw new GraphQLError("Can't processed addBook request", {
            extensions: { code: 'BAD_USER_INPUT' },
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
      logger.http(filter.length)
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

    editAuthor: async (parent, args) => {
      try {
        const author = await Author.findByIdAndUpdate(args.id, args.bornInput, {
          new: true,
        })
        if (author) {
          return author
        }
      } catch (error) {
        throw new GraphQLError("Can't processed editAuthor request", {
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
        //logger.warn(booksByAuthor)
        if (booksByAuthor) return booksByAuthor
      } catch (error) {
        logger.error(error.extensions?.code)
        throw new GraphQLError("Can't processed bookCount for Author request", {
          extensions: { code: 'BAD_REQUEST' },
        })
      }
    },
  },
}
