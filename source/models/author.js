import { Schema, model } from 'mongoose'

export const AuthorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    born: {
      type: Number,
    },
    booksCollection: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Book'
      }
    ]
  },
  { timestamps: true }
)

AuthorSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const Author = model('Author', AuthorSchema)

export default Author
