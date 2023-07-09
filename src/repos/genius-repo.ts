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
    PostWorkFromHomeDto
} from "../types/genius-dto";
import {flow, pipe} from 'fp-ts/function'
import mongoose, {Error} from "mongoose";
import {AssignedTaskDoc, GeniusBarDoc, GeniusDoc, MemberStatusDoc, SayNoNoDoc, WorkFromHomeDoc} from "../types/genius-doc";

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

const validatePreStatus = (newStatus: 'SayNoNo' | 'GeniusBar' | 'WorkFromHome') =>
    TSP.match(newStatus)
        .with('SayNoNo', () => 'WorkFromHome')
        .with('GeniusBar', () => 'SayNoNo')
        .with('WorkFromHome', () => 'GeniusBar')
        .exhaustive()

const validCurrentStatus: (postDto: PostMemberStatusDto) => TE.TaskEither<Error, string> = (postDto) =>
    pipe(
        getGeniusById(postDto.genius_Id),
        TE.flatMap(TE.fromOption(() => new Error('genius id not found'))),
        TE.flatMap((g) => pipe(
            g.memberStatuses,
            (ms) => A.reduce(ms[0], (pre, cur: MemberStatusDoc) =>
                cur.issueTime.getTime() > pre.issueTime.getTime() ? cur : pre)(ms),
            O.fromNullable,
            O.match(
                () => TE.right('Initial cond'),
                (latestStatus) => latestStatus.kind === validatePreStatus(postDto.kind)
                    ? TE.right('right status') : TE.left(new Error(`Wrong pre status ${latestStatus.kind}`))
            )
        ))
    )

const sayNoNoMapper: (postDto: PostSayNoNoDto) => SayNoNoDoc = (postDto) => ({
    kind: 'SayNoNo',
    issueTime: postDto.issueDate,
    toBeReject: postDto.toBeReject,
    ...(postDto.coolDownUntilDate && {coolDownUntilDate: postDto.coolDownUntilDate})
})

const geniusBarMapper: (postDto: PostGeniusBarDto) => GeniusBarDoc = (postDto) => ({
    kind: 'GeniusBar',
    issueTime: postDto.issueDate,
    resolvedIssues: postDto.resolvedIssues
})

const workFromHomeMapper: (postDto: PostWorkFromHomeDto) => WorkFromHomeDoc = (postDto) => ({
    kind: 'WorkFromHome',
    issueTime: postDto.issueDate,
    assignedTasks: []
})

const appendMemberStatusChange: (postDto: PostMemberStatusDto) => TE.TaskEither<Error, GeniusDoc> = (postDto) => pipe(
    TSP.match(postDto)
        .with({kind: 'SayNoNo'}, sayNoNoMapper)
        .with({kind: 'GeniusBar'}, geniusBarMapper)
        .with({kind: 'WorkFromHome'}, workFromHomeMapper)
        .exhaustive(),
    (doc) => TE.tryCatch(
        () => GeniusModel.findByIdAndUpdate(postDto.genius_Id,
            { $push: { memberStatuses: doc }}, {new: true}),
        (reason) => reason as Error
    ),
    TE.flatMap(TE.fromNullable(new Error(`Genius Id ${postDto.genius_Id} Not found`)))
)

export const issueMemberStatus: (postDto: PostMemberStatusDto) => TE.TaskEither<Error, GeniusDoc> = (postDto) => pipe(
    postDto,
    validCurrentStatus,
    TE.flatMap(() => appendMemberStatusChange(postDto))
)
