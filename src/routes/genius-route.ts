import {FastifyInstance, RouteShorthandOptions} from "fastify";
import {Error} from "mongoose";
import {createGenius, getGeniuses, issueGeniusBar, issueSayNoNo, issueWorkFromHome} from "../repos/genius-repo";
import {PostGeniusBarDto, PostGeniusDto, PostSayNoNoDto, PostWorkFromHomeDto} from "../types/genius-dto";
import * as TE from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/function'
import * as TSP from 'ts-pattern'

export const GeniusRoute = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
    // TODO: Response Schema

    // TODO: Use TaskEither
    server.get('/genius', async (req, rpl) => {
        const geniuses = await getGeniuses()
        return rpl.status(200).send(geniuses)
    })

    server.post<{Body: PostGeniusDto}>('/genius', async (req, rpl) =>
        pipe(
            req.body,
            createGenius,
            TE.match(
                (err) => TSP.match(err)
                    .with(TSP.P.instanceOf(Error.ValidationError), (ev) => rpl.status(400).send(ev))
                    .with(TSP.P.instanceOf(Error), (e) => rpl.status(500).send(e))
                    .exhaustive(),
                (genius) => rpl.status(201).send(genius)
            )
        )()
    )

    // TODO: Combine all member status update endpoints
    server.post<{Body: PostSayNoNoDto}>('/genius/memberStatus/say-no-no', (req, rpl) =>
        pipe(
            req.body,
            issueSayNoNo,
            TE.match(
                (err) => TSP.match(err)
                    .with(TSP.P.instanceOf(Error.ValidationError), (ev) => rpl.status(400).send(ev))
                    .with(TSP.P.instanceOf(Error), (e) => rpl.status(500).send(e))
                    .exhaustive(),
                (genius) => rpl.status(200).send(genius)
            )
        )()
    )

    server.post<{Body: PostGeniusBarDto}>('/genius/memberStatus/genius-bar', (req, rpl) =>
        pipe(
            req.body,
            issueGeniusBar,
            TE.match(
                (err) => TSP.match(err)
                    .with(TSP.P.instanceOf(Error.ValidationError), (ev) => rpl.status(400).send(ev))
                    .with(TSP.P.instanceOf(Error), (e) => rpl.status(500).send(e))
                    .exhaustive(),
                (genius) => rpl.status(200).send(genius)
            )
        )()
    )

    // Leave imperative for cross comparing
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