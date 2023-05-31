import { FastifyInstance, RouteShorthandOptions } from 'fastify'
import * as VideoService from '../services/video-service'

export const VideoRoute = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  server.get('/videos', async (req, rpl) => {
    const videos = await VideoService.getVideos()
    return rpl.status(200).send({ videos })
  })

  done()
}
