import mongoose, { Schema, model } from 'mongoose'
import { Video } from '../types/video'

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
      type: [String]
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
