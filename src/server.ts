import fastify, { FastifyInstance, FastifyListenOptions } from 'fastify'
import { establishConnection } from './plugins/mongoose'
import { SearchTag } from './types/search-tag'
import { VideoRoute } from './routes/video-route'
import {GeniusRoute} from "./routes/genius-route";
import fastifyStatic from "@fastify/static";
import path from "path";

const app: FastifyInstance = fastify({
  logger: {
    transport: {
      target: 'pino-pretty'
    },
    level: 'debug'
  }
})

export default function startFastify(config: AppConfig): FastifyInstance {
  const fastifyConfig: FastifyListenOptions = {
    port: config.port,
    host: config.host
  }

  app.register(fastifyStatic, {
    root: path.join(__dirname, '../docusaurus/build'),
    prefix: '/'
  })

  app.get('/hc', async (request, reply) => reply.status(200).send({ msg: 'healthy' }))
  app.get('/tags', async (req, rpl) => {
    const searchTags = Object.values(SearchTag)
    console.log(searchTags)
    rpl.status(200).send({ searchTags })
  })
  app.register(VideoRoute, { prefix: '/api/v1' })
  app.register(GeniusRoute, { prefix: '/api/v1' })

  app.listen(fastifyConfig, (err, _) => {
    if (err) {
      console.error(err)
    }

    if (process.env.NODE_ENV !== 'test') {
      establishConnection(config.mongoConnectionString)
          .then(() => {
            console.log('Connect mongoDB successfully')
          })
          .catch((err) => {
            console.log(err)
          })
    }
  })

  return app
}
