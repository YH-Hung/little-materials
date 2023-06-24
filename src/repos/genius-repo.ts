import * as TE from 'fp-ts/TaskEither'
import GeniusModel, {GeniusBarModel, SayNoNoModel, WorkFromHomeModel} from '../models/genius-model'
import {PostGeniusBarDto, PostGeniusDto, PostSayNoNoDto, PostWorkFromHomeDto} from "../types/genius-dto";
import {flow, pipe} from 'fp-ts/function'
import mongoose, {Error} from "mongoose";
import {GeniusBarDoc, GeniusDoc, MemberStatusDoc, SayNoNoDoc, WorkFromHomeDoc} from "../types/genius-doc";

// TODO: Refine Typing
export const createGenius: (postDto: PostGeniusDto) => TE.TaskEither<Error, GeniusDoc> =
    (postDto) => TE.tryCatch(
    () => GeniusModel.create(postDto),
    (reason) => reason as Error
)

// TODO: Typed query
export const getGeniuses = () => GeniusModel.find()
    .populate('latestMemberStatus')
    .exec()

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
        issueTime: postDto.issueDate
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
