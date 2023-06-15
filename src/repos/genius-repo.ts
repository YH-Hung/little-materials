import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import GeniusModel, {MemberStatusModel} from '../models/genius-model'
import {PostGeniusDto, PostMemberStatusDto} from "../types/genius-dto";
import * as T from '../types/genius'
import {GeniusInfo, geniusJoinDateOf} from '../types/genius'
import {pipe} from 'fp-ts/function'

interface GeniusDoc {
    _id: string,
    name: string,
    joinDate: Date
}

export const createGenius = (postDto: PostGeniusDto) => GeniusModel.create(postDto)
export const getGeniuses = () => GeniusModel.find()
    .populate({
        path: 'memberStatuses',
        perDocumentLimit: 1,
        options: { sort: {'createdAt': -1}}
    })
    .exec()

export const createMemberStatusRecord = async (postDto: PostMemberStatusDto) => {
    const theGenius = await GeniusModel.findById(postDto.genius_Id).exec()
    const status = await MemberStatusModel.create({
        genius: theGenius._id,
        memberStatus: postDto.memberStatus,
        issueTime: postDto.issueDate
    });
    theGenius.memberStatuses.push(status._id)
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

export const addGenius = (dto: PostGeniusDto) =>
    pipe(dto,
        (dto) => ({
            name: T.geniusNameOf(dto.name),
            joinDate: dto.joinDate
        }),
        (dto) =>
            pipe(dto.name, O.match(
                () => TE.left("Error Name"),
                (name: T.GeniusName) => TE.right(T.geniusInfoOf(name)(geniusJoinDateOf(dto.joinDate)))
            )),
            TE.chain(safeCreateGenius),
            TE.chain((doc: GeniusDoc) =>
                pipe(
                    O.some(T.geniusOf),
                    O.ap(T.geniusIdOf(doc._id)),
                    O.ap(T.geniusNameOf(doc.name)),
                    O.ap(pipe(doc.joinDate, T.geniusJoinDateOf, O.some)),
                    TE.fromOption(() => "Wrong Doc")
                )
            ),
            TE.map((g: T.Genius) => ({
                geniusId: T.fromGeniusId(g.geniusId),
                geniusName: T.fromGeniusName(g.geniusName),
                geniusJoinDate: T.fromGeniusJoinDate(g.geniusJoinDate)
            }))
        )

