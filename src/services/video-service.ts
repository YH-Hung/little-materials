import VideoModel from '../models/video-model'
import { Video } from '../types/video'

export const getVideos: () => Promise<Array<Video>> = () => {
  return VideoModel.find()
}
