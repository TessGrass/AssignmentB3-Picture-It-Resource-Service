import mongoose from 'mongoose'
const Schema = mongoose.Schema

const imageSchema = new Schema({
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: String,
    required: true,
    immutable: true,
    trim: true
  },
  imgId: {
    type: String,
    required: true,
    immutable: true,
    trim: true
  },
  imgUrl: {
    type: String,
    required: true,
    immutable: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  contentType: {
    type: String,
    required: true,
    trim: true,
    enum: ['image/gif', 'image/jpeg', 'image/png']
  }
}, {
  timestamps: true,
  toJSON: {
    /**
     * Performs a transformation of the resulting object to remove sensitive information.
     *
     * @param {object} doc - The mongoose document which is being converted.
     * @param {object} ret - The plain object representation which has been converted.
     */
    transform: function (doc, ret) {
      delete ret._id
      delete ret.__v
    },
    virtuals: true // ensure virtual fields are serialized
  }
})

imageSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

export const Image = mongoose.model('image', imageSchema)
