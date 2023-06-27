import * as TE from 'fp-ts/TaskEither'
import GeniusModel, {AssignedTaskModel, GeniusBarModel, SayNoNoModel, WorkFromHomeModel} from '../models/genius-model'
import {
    PostAssignedTaskDto,
    PostGeniusBarDto,
    PostGeniusDto,
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

export const getGeniuses = () => GeniusModel.find<GeniusDoc>()
    .populate<{latestMemberStatus: SayNoNoDoc | GeniusDoc | WorkFromHomeDoc}>({
        path: 'latestMemberStatus',
        populate: { path: 'assignedTasks' }})
    .exec()

const getGeniusById = (id: string | mongoose.Types.ObjectId) => TE.tryCatch(
    () => GeniusModel.findById<GeniusDoc>(id)
    .populate<{latestMemberStatus: SayNoNoDoc | GeniusDoc | WorkFromHomeDoc}>({
        path: 'latestMemberStatus',
        populate: { path: 'assignedTasks' }})
    .exec(),
    (reason) => reason as Error
)

const createSayNoNo: (postDto: PostSayNoNoDto) => TE.TaskEither<Error, SayNoNoDoc> =
    (postDto) => TE.tryCatch(
    () => SayNoNoModel.create({
        genius: new mongoose.Types.ObjectId(postDto.genius_Id),
        issueTime: postDto.issueDate,
        toBeReject: postDto.toBeReject,
        ...(postDto.coolDownUntilDate && {coolDownUntilDate: postDto.coolDownUntilDate})
    }),
    (reason) => reason as Error
)

const createGeniusBar: (postDto: PostGeniusBarDto) => TE.TaskEither<Error, GeniusBarDoc> = (postDto) => TE.tryCatch(
    () => GeniusBarModel.create({
        genius: new mongoose.Types.ObjectId(postDto.genius_Id),
        issueTime: postDto.issueDate,
        resolvedIssues: postDto.resolvedIssues
    }),
    (reason) => reason as Error
)

const createWorkFromHome: (postDto: PostWorkFromHomeDto) => TE.TaskEither<Error, WorkFromHomeDoc> = (postDto) => TE.tryCatch(
    () => WorkFromHomeModel.create({
        genius: new mongoose.Types.ObjectId(postDto.genius_Id),
        issueTime: postDto.issueDate,
        assignedTasks: []
    }),
    (reason) => reason as Error
)

const updateStatusIdBackToGenius: (status: MemberStatusDoc) => TE.TaskEither<Error, GeniusDoc> = (status) => pipe(
    TE.tryCatch(
        () => GeniusModel.findByIdAndUpdate(status.genius, {latestMemberStatus: status._id}, {new: true})
            .populate('latestMemberStatus'),
        (reason) => reason as Error
    ),
    TE.flatMap(TE.fromNullable(new Error('Genius Id Not found')))
)

export const issueSayNoNo = flow(createSayNoNo, TE.flatMap(updateStatusIdBackToGenius))
export const issueGeniusBar = flow(createGeniusBar, TE.flatMap(updateStatusIdBackToGenius))
export const issueWorkFromHome = flow(createWorkFromHome, TE.flatMap(updateStatusIdBackToGenius))

const createAssignedTask: (postDto: PostAssignedTaskDto) => TE.TaskEither<Error, AssignedTaskDoc> = (postDto) => TE.tryCatch(
    () => AssignedTaskModel.create({
        memberStatus: new mongoose.Types.ObjectId(postDto.statusId),
        issueTime: postDto.issueDate,
        taskName: postDto.taskName
    }),
    (reason) => reason as Error
)

const appendWorkFromHomeTask: (assignedTask: AssignedTaskDoc) => TE.TaskEither<Error, WorkFromHomeDoc> = (assignedTask) => pipe(
    TE.tryCatch(
        () => WorkFromHomeModel.findByIdAndUpdate(assignedTask.memberStatus,
            { $push: { assignedTasks: assignedTask._id }}, {new: true}),
        (reason) => reason as Error
    ),
    TE.flatMap(TE.fromNullable(new Error('Status Id Not found')))
)

export const issueAssignedTask = flow(
    createAssignedTask,
    TE.flatMap(appendWorkFromHomeTask),
    TE.map((wd) => wd.genius),
    TE.flatMap(getGeniusById),
    TE.flatMap(TE.fromNullable(new Error('Genius Id Not found')))
)