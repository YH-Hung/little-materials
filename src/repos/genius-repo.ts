import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import GeniusModel from '../models/genius-model'
import {PostGeniusDto} from "../types/genius-dto";
import * as T from '../types/genius'
import {pipe} from 'fp-ts/function'
import {GeniusInfo, geniusJoinDateOf} from "../types/genius";

interface GeniusDoc {
    _id: string,
    name: string,
    joinDate: Date
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

