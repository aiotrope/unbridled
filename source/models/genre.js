import { Schema, model } from 'mongoose'

const GenreSchema = new Schema(
  {
    category: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      minLength: 4,
      validate: {
        validator: (val) => {
          return /^[a-zA-Z\s-]{4,}?$/gm.test(val)
        },
        message: (props) => `${props.value} is not a valid genre!`,
      },
    },
    books: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
  },
  { timestamps: true }
)

GenreSchema.set('toJSON', {
  transform: (document, retObject) => {
    retObject.id = retObject._id.toString()
    delete retObject._id
    delete retObject.__v
  },
})

const Genre = model('Genre', GenreSchema)

module.exports = Genre
