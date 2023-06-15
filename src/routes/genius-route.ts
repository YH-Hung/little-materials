import {FastifyInstance, RouteShorthandOptions} from "fastify";
import {Error} from "mongoose";
import * as VideoService from "../services/video-service";
import {VideoBody} from "../types/video";
import {createGenius, getGeniuses} from "../repos/genius-repo";
import {PostGeniusDto} from "../types/genius-dto";

export const GeniusRoute = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
    server.get('/genius', async (req, rpl) => {
        const geniuses = await getGeniuses()
        return rpl.status(200).send(geniuses)
    })

    server.post('/genius', async (req, rpl) => {
        try {
            const geniusBody = req.body as PostGeniusDto
            const genius = await createGenius(geniusBody)
            return rpl.status(201).send(genius)
        } catch (err) {
            if (err instanceof Error.ValidationError) {
                return rpl.status(400).send({ msg: err.toString() })
            }
            return rpl.status(500).send({ msg: `Internal Server Error: ${err}` })
        }
    })

    done()
}