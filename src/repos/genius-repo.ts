import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import * as TSP from 'ts-pattern'
import GeniusModel from '../models/genius-model'
import {
    PostAssignedTaskDto,
    PostGeniusBarDto,
    PostGeniusDto, PostMemberStatusDto,
    PostSayNoNoDto,
    PostWorkFromHomeDto, PutTaskReleaseDto
} from "../types/genius-dto";
import {flow, pipe} from 'fp-ts/function'
import mongoose, {Error} from "mongoose";
import {
    GeniusBarDoc,
    GeniusDoc,
    MemberStatusDoc,
    SayNoNoDoc,
    StatusKind,
    WorkFromHomeDoc
} from "../types/genius-doc";

export const createGenius: (postDto: PostGeniusDto) => TE.TaskEither<Error, GeniusDoc> =
    (postDto) => TE.tryCatch(
    () => GeniusModel.create(postDto),
    (reason) => reason as Error
)

export const getGeniuses = () => GeniusModel.find<GeniusDoc>().exec()

const getGeniusById: (id: string | mongoose.Types.ObjectId) => TE.TaskEither<Error, O.Option<GeniusDoc>> =
    (id) => pipe(
        TE.tryCatch(
            () => GeniusModel.findById<GeniusDoc>(id)
                .exec(),
            (reason) => reason as Error
        ),
        TE.map(O.fromNullable)
)

const getValidPreStatus = (newStatus: StatusKind) =>
    TSP.match(newStatus)
        .with('SayNoNo', () => 'WorkFromHome')
        .with('GeniusBar', () => 'SayNoNo')
        .with('WorkFromHome', () => 'GeniusBar')
        .exhaustive()

const checkGeniusExisted = flow(
    getGeniusById,
    TE.flatMap(TE.fromOption(() => new Error('genius id not found'))),
)

export const aggregateCurrentStatus = (gDoc: GeniusDoc) => pipe(
    gDoc.memberStatuses,
    (ms) => A.reduce(ms[0], (pre, cur: MemberStatusDoc) =>
        cur.issueTime.getTime() > pre.issueTime.getTime() ? cur : pre)(ms),
    O.fromNullable,
)

const validPreviousStatus: (postDto: PostMemberStatusDto) => TE.TaskEither<Error, string> = (postDto) =>
    pipe(
        checkGeniusExisted(postDto.genius_Id),
        TE.flatMap(flow(
            aggregateCurrentStatus,
            O.match(
                () => TE.right('Initial cond'),
                (latestStatus) => latestStatus.kind === getValidPreStatus(postDto.kind)
                    ? TE.right('right status') : TE.left(new Error(`Wrong pre status ${latestStatus.kind}`))
            )
        ))
    )

const sayNoNoMapper: (postDto: PostSayNoNoDto) => Omit<SayNoNoDoc, '_id'> = (postDto) => ({
    kind: 'SayNoNo',
    issueTime: postDto.issueDate,
    toBeReject: postDto.toBeReject,
    ...(postDto.coolDownUntilDate && {coolDownUntilDate: postDto.coolDownUntilDate})
})

const geniusBarMapper: (postDto: PostGeniusBarDto) => Omit<GeniusBarDoc, '_id'> = (postDto) => ({
    kind: 'GeniusBar',
    issueTime: postDto.issueDate,
    resolvedIssues: postDto.resolvedIssues
})

const workFromHomeMapper: (postDto: PostWorkFromHomeDto) => Omit<WorkFromHomeDoc, '_id'> = (postDto) => ({
    kind: 'WorkFromHome',
    issueTime: postDto.issueDate,
})

const appendMemberStatusChange: (postDto: PostMemberStatusDto) => TE.TaskEither<Error, GeniusDoc> = (postDto) => pipe(
    TSP.match(postDto)
        .with({kind: 'SayNoNo'}, sayNoNoMapper)
        .with({kind: 'GeniusBar'}, geniusBarMapper)
        .with({kind: 'WorkFromHome'}, workFromHomeMapper)
        .exhaustive(),
    (doc) => TE.tryCatch(
        () => GeniusModel.findByIdAndUpdate<GeniusDoc>(postDto.genius_Id,
            { $push: { memberStatuses: doc }}, {new: true}),
        (reason) => reason as Error
    ),
    TE.flatMap(TE.fromNullable(new Error(`Genius Id ${postDto.genius_Id} Not found`)))
)

export const issueMemberStatus = (postDto: PostMemberStatusDto) => pipe(
    validPreviousStatus(postDto),
    TE.flatMap(() => appendMemberStatusChange(postDto))
)

const validateCurrentStatusThenGetId =
    flow(
        checkGeniusExisted,
        TE.flatMap(flow(
            aggregateCurrentStatus,
            O.match(
                () => TE.left(new Error('Status array is empty')),
                (latestStatus) => latestStatus.kind === 'WorkFromHome'
                    ? TE.right(latestStatus) : TE.left(new Error(`Wrong current status ${latestStatus.kind}`))
            )
        ))
    )
// : (postDto: PostAssignedTaskDto) => TE.TaskEither<Error, GeniusDoc>
const appendAssignedTask: (postDto: PostAssignedTaskDto) => TE.TaskEither<Error, GeniusDoc> =
    (postDto) => pipe(
        TE.tryCatch(
            () => GeniusModel.findByIdAndUpdate<GeniusDoc>(postDto.geniusId,
                { $push: { assignedTasks: {issueTime: postDto.issueDate, taskName: postDto.taskName} }},
                { new: true }
                ),
            (reason) => reason as Error
        ),
        TE.flatMap(TE.fromNullable(new Error(`Genius Id ${postDto.geniusId} Not found`)))
    )

export const issueAssignedTask = (postDto: PostAssignedTaskDto) =>
    pipe(
        postDto.geniusId,
        validateCurrentStatusThenGetId,
        TE.flatMap(() => appendAssignedTask(postDto))
    )

export const releaseAssignTask: (putDto: PutTaskReleaseDto) => TE.TaskEither<Error, GeniusDoc> = (putDto) =>
    pipe(
        TE.tryCatch(
            () => GeniusModel.findByIdAndUpdate<GeniusDoc>(putDto.geniusId,
                { $set: { "assignedTasks.$[elem].release": {releaseAt: putDto.releaseAt, ...(putDto.reason && {reason: putDto.reason})} }},
                { arrayFilters: [{"elem.taskName": putDto.taskName }], new: true }
            ),
            (reason) => reason as Error
        ),
        TE.flatMap(TE.fromNullable(new Error(`Genius Id ${putDto.geniusId} Not found`)))
    )
