import { FastifyInstance, RouteShorthandOptions } from 'fastify'
import * as VideoService from '../services/video-service'
import { VideoBody } from '../types/video'
import { Error } from 'mongoose'

export const VideoRoute = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  server.get('/videos', async (req, rpl) => {
    const videos = await VideoService.getVideos()
    return rpl.status(200).send({ videos })
  })

  server.post('/videos', async (req, rpl) => {
    try {
      const videoBody = req.body as VideoBody
      const video = await VideoService.addNewVideo(videoBody)
      return rpl.status(201).send({ video })
    } catch (err) {
      if (err instanceof Error.ValidationError) {
        return rpl.status(400).send({ msg: err.toString() })
      }
      return rpl.status(500).send({ msg: `Internal Server Error: ${err}` })
    }
  })

  done()
}
