const mongoose = require('mongoose')

const GenreSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      minLength: 4,
      validate: {
        validator: (val) => {
          return /^[a-zA-Z\s-]{4,}?$/gm.test(
            val
          )
        },
        message: (props) => `${props.value} is not a valid genre!`,
      },
    },
  },
  { timestamps: true }
)

GenreSchema.set('toJSON', {
  transform: (document, retObject) => {
    retObject.id = retObject._id.toString()
    delete retObject._id
    delete retObject.__v
    delete retObject.password
  },
})

const Genre = mongoose.model('Genre', GenreSchema)

module.exports = Genre
