import fastify, {FastifyInstance, FastifyListenOptions} from "fastify";
import {establishConnection} from "./plugins/mongoose";

const server : FastifyInstance = fastify({
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

    server.get('/hc', async (request, reply) =>
        reply.status(200).send({msg: 'healthy'}))

    server.listen(fastifyConfig, (err, _) => {
        if (err) {
            console.error(err)
        }
        establishConnection(config.mongoConnectionString)
            .then(r => {
                console.log('Connect mongoDB successfully')
            })
    })

    return server
}