import { Schema, model } from 'mongoose'

export const AuthorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    born: {
      type: Number,
    },
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
