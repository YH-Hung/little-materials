import {FastifyInstance, RouteShorthandOptions} from "fastify";
import {Error} from "mongoose";
import {createGenius, getGeniuses, issueGeniusBar, issueSayNoNo, issueWorkFromHome} from "../repos/genius-repo";
import {PostGeniusBarDto, PostGeniusDto, PostSayNoNoDto, PostWorkFromHomeDto} from "../types/genius-dto";

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

    server.post<{Body: PostSayNoNoDto}>('/genius/memberStatus/say-no-no', async (req, rpl) => {
        try {
            const statusBody = req.body
            const status = await issueSayNoNo(statusBody)
            return rpl.status(201).send(status)
        } catch (err) {
            if (err instanceof Error.ValidationError) {
                return rpl.status(400).send({msg: err.toString()})
            }
            return rpl.status(500).send({msg: `Internal Server Error: ${err}`})
        }
    })

    server.post<{Body: PostGeniusBarDto}>('/genius/memberStatus/genius-bar', async (req, rpl) => {
        try {
            const statusBody = req.body
            const status = await issueGeniusBar(statusBody)
            return rpl.status(201).send(status)
        } catch (err) {
            if (err instanceof Error.ValidationError) {
                return rpl.status(400).send({msg: err.toString()})
            }
            return rpl.status(500).send({msg: `Internal Server Error: ${err}`})
        }
    })

    server.post<{Body: PostWorkFromHomeDto}>('/genius/memberStatus/work-from-home', async (req, rpl) => {
        try {
            const statusBody = req.body
            const status = await issueWorkFromHome(statusBody)
            return rpl.status(201).send(status)
        } catch (err) {
            if (err instanceof Error.ValidationError) {
                return rpl.status(400).send({msg: err.toString()})
            }
            return rpl.status(500).send({msg: `Internal Server Error: ${err}`})
        }
    })

    done()
}