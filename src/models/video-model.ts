import mongoose, { Schema, model } from 'mongoose'
import { Video } from '../types/video'
import { SearchTag } from '../types/search-tag'

const videoSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    },
    tags: {
      type: [String],
      enum: SearchTag // Mongoose will run Object.values() on the object to get the desired values.
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false
    }
  }
)

export default mongoose.models.Video || model<Video>('Video', videoSchema)
