import VideoModel from '../models/video-model'
import { Video, VideoBody } from '../types/video'

export async function addNewVideo(videoBody: VideoBody) {
  return VideoModel.create(videoBody)
}

export const getVideoById: (id: string) => Promise<Video | null> = (id) => {
  return VideoModel.findById(id)
}

export const getVideos: () => Promise<Array<Video>> = () => {
  return VideoModel.find()
}
