import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import GeniusModel, {
    GeniusBarModel,
    MemberStatusBaseModel,
    SayNoNoModel,
    WorkFromHomeModel
} from '../models/genius-model'
import {PostGeniusBarDto, PostGeniusDto, PostSayNoNoDto, PostWorkFromHomeDto} from "../types/genius-dto";
import * as T from '../types/genius'
import {GeniusInfo, geniusJoinDateOf} from '../types/genius'
import {pipe} from 'fp-ts/function'
import {Schema} from "mongoose";

interface GeniusDoc {
    _id: Schema.Types.ObjectId,
    name: string,
    joinDate: Date
}

export const createGenius = (postDto: PostGeniusDto) => GeniusModel.create(postDto)
export const getGeniuses = () => GeniusModel.find()
    .populate('latestMemberStatus')
    .exec()

export const issueSayNoNo = async (postDto: PostSayNoNoDto) => {
    const theGenius = await GeniusModel.findById(postDto.genius_Id).exec()
    const status = await SayNoNoModel.create({
        genius: theGenius._id,
        issueTime: postDto.issueDate,
        toBeReject: postDto.toBeReject,
        ...(postDto.coolDownUntilDate && {coolDownUntilDate: postDto.coolDownUntilDate})
    })

    theGenius.latestMemberStatus = status._id
    await theGenius.save()
    return status
}

export const issueGeniusBar = async (postDto: PostGeniusBarDto) => {
    const theGenius = await GeniusModel.findById(postDto.genius_Id).exec()
    const status = await GeniusBarModel.create({
        genius: theGenius._id,
        issueTime: postDto.issueDate,
        resolvedIssues: postDto.resolvedIssues
    })

    theGenius.latestMemberStatus = status._id
    await theGenius.save()
    return status
}

export const issueWorkFromHome = async (postDto: PostWorkFromHomeDto) => {
    const theGenius = await GeniusModel.findById(postDto.genius_Id).exec()
    const status = await WorkFromHomeModel.create({
        genius: theGenius._id,
        issueTime: postDto.issueDate
    })

    theGenius.latestMemberStatus = status._id
    await theGenius.save()
    return status
}

const safeCreateGenius: (gInfo: GeniusInfo) => TE.TaskEither<string, GeniusDoc> = (gInfo: GeniusInfo) => TE.tryCatch(
    () => GeniusModel.create({
        name: T.fromGeniusName(gInfo.geniusName),
        joinDate: T.fromGeniusJoinDate(gInfo.geniusJoinDate)
    }),
    (reason) => String(reason)
)

// export const addGenius = (dto: PostGeniusDto) =>
//     pipe(dto,
//         (dto) => ({
//             name: T.geniusNameOf(dto.name),
//             joinDate: dto.joinDate
//         }),
//         (dto) =>
//             pipe(dto.name, O.match(
//                 () => TE.left("Error Name"),
//                 (name: T.GeniusName) => TE.right(T.geniusInfoOf(name)(geniusJoinDateOf(dto.joinDate)))
//             )),
//             TE.chain(safeCreateGenius),
//             TE.chain((doc: GeniusDoc) =>
//                 pipe(
//                     O.some(T.geniusOf),
//                     O.ap(T.geniusIdOf(doc._id.toString())),
//                     O.ap(T.geniusNameOf(doc.name)),
//                     O.ap(pipe(doc.joinDate, T.geniusJoinDateOf, O.some)),
//                     TE.fromOption(() => "Wrong Doc")
//                 )
//             ),
//             TE.map((g: T.Genius) => ({
//                 geniusId: T.fromGeniusId(g.geniusId),
//                 geniusName: T.fromGeniusName(g.geniusName),
//                 geniusJoinDate: T.fromGeniusJoinDate(g.geniusJoinDate)
//             }))
//         )

