import {FastifyInstance, RouteShorthandOptions} from "fastify";
import {Error} from "mongoose";
import {createGenius, getGeniuses, issueGeniusBar, issueSayNoNo, issueWorkFromHome} from "../repos/genius-repo";
import {
    PostGeniusBarDto,
    PostGeniusDto,
    PostMemberStatusDto,
    PostSayNoNoDto,
    PostWorkFromHomeDto
} from "../types/genius-dto";
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

    // TODO: io-ts validation
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

    // TODO: io-ts validation
    server.post<{Body: PostMemberStatusDto}>('/genius/memberStatus', (req, rpl) =>
        pipe(
            req.body,
            (body) => TSP.match(body)
                .with({kind: 'SayNoNo'}, issueSayNoNo)
                .with({kind: 'GeniusBar'}, issueGeniusBar)
                .with({kind: 'WorkFromHome'}, issueWorkFromHome)
                .exhaustive(),
            TE.match(
                (err) => TSP.match(err)
                    .with(TSP.P.instanceOf(Error.ValidationError), (ev) => rpl.status(400).send(ev))
                    .with(TSP.P.instanceOf(Error), (e) => rpl.status(500).send(e))
                    .exhaustive(),
                (genius) => rpl.status(200).send(genius)
            )
        )()
    )

    done()
}