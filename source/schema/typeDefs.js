export const typeDefs = `#graphql
    type User {
        username: String!
        id:ID!
        favoriteGenre: [Genre!]!
        books: [Book!]!
        successSignupMessage: String!
    }

    input CreateUserInput {
        username: String!
        password: String!
        favoriteGenre: [ID!]!
    }

    type Token {
        token: String!
        id: ID!
        username: String!
        successLoginMessage: String!
    }

    type Author {
        name: String
        id: ID!
        born: Int
        bookCount: Int
    }

    input AuthorInput {
        name: String
        born: Int
    }

    input BornInput {
        born: Int!
    }

    type Genre {
        category: String!
        id: ID!
    }

    input GenreInput {
        category: String!
    }

    type Book {
        title: String!
        id: ID!
        published: Int!
        author: [Author!]!
        genres: [String]!
    }

    type Query {
        authorCount: Int!
        bookCount: Int!
        allUsers: [User!]!
        allAuthors: [Author!]!
        allBooks(author: String, authorId: String, genre: String): [Book!]!
        allGenres: [Genre!]!
    }

    type Mutation {
        createUser(createUserInput: CreateUserInput!): User

        login(username: String! password: String!): Token

        addAuthor(authorInput: AuthorInput!): Author

        addBook(
            title: String!
            published: Int!
            author: String!
            genres: [String!]!
        ): Book

        addGenre(genreInput: GenreInput!): Genre

        editAuthor(
            id: ID!
            bornInput: BornInput!
        ): Author
    }
   
`
