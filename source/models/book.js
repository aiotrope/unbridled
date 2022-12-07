import { Schema, model } from 'mongoose'

const BookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    published: {
      type: Number,
      required: true,
    },
    author: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Author',
      },
    ],
    genres: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Genre',
      },
    ],
    user: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
)

BookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const Book = model('Book', BookSchema)

export default Book
