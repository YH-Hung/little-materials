import {FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions} from "fastify";
import {Error} from "mongoose";
import * as GeniusRepo from "../repos/genius-repo";
import {
    PostAssignedTaskDto,
    PostGeniusDto,
    PostMemberStatusDto, PutTaskReleaseDto,
} from "../types/genius-dto";
import * as TE from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/function'
import * as TSP from 'ts-pattern'
import {convertToViews} from "../services/genius-service";

const postErrorMapping = (err: Error, req: FastifyRequest, rpl: FastifyReply) => TSP.match(err)
    .with(TSP.P.instanceOf(Error.ValidationError), (ev) => rpl.status(400).send(ev))
    .with(TSP.P.instanceOf(Error), (e) => rpl.status(500).send(e))
    .exhaustive()

export const GeniusRoute = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
    // TODO: Response Schema

    // TODO: Use TaskEither
    server.get('/genius', async (req, rpl) => {
        const geniuses = await GeniusRepo.getGeniuses()
        return rpl.status(200).send(convertToViews(geniuses))
    })

    // TODO: io-ts validation
    server.post<{Body: PostGeniusDto}>('/genius', async (req, rpl) =>
        pipe(
            req.body,
            GeniusRepo.createGenius,
            TE.match(
                (err) => postErrorMapping(err, req, rpl),
                (genius) => rpl.status(201).send(genius)
            )
        )()
    )

    // TODO: io-ts validation
    server.post<{Body: PostMemberStatusDto}>('/genius/memberStatus', (req, rpl) =>
        pipe(
            req.body,
            GeniusRepo.issueMemberStatus,
            TE.match(
                (err) => postErrorMapping(err, req, rpl),
                (genius) => rpl.status(200).send(genius)
            )
        )()
    )

    server.post<{Body: PostAssignedTaskDto}>('/genius/memberStatus/task', (req, rpl) => {
        pipe(
            req.body,
            GeniusRepo.issueAssignedTask,
            TE.match(
                (err) => postErrorMapping(err, req, rpl),
                (genius) => rpl.status(201).send(genius)
            )
        )()
    })

    server.put<{Body: PutTaskReleaseDto}>('/genius/memberStatus/task', (req, rpl) => {
        pipe(
            req.body,
            GeniusRepo.releaseAssignTask,
            TE.match(
                (err) => postErrorMapping(err, req, rpl),
                (genius) => rpl.status(200).send(genius)
            )
        )()
    })

    done()
}