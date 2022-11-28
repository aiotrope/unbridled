export const typeDefs = `#graphql
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
        allAuthors: [Author!]!
        allBooks(author: String, authorId: String, genre: String): [Book!]!
    }

    type Mutation {
        addAuthor(authorInput: AuthorInput): Author
        addBook(
            title: String!
            published: Int!
            author: String!
            genres: [String]!
        ): Book

        editAuthor(
            id: ID!
            bornInput: BornInput!
        ): Author
    }
   
`
