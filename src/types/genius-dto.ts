import * as E from 'fp-ts/Either'
import * as t from 'io-ts'

// represents a Date from an ISO string
const DateFromString = new t.Type<Date, string, unknown>(
    'DateFromString',
    (u): u is Date => u instanceof Date,
    (u, c) =>
        E.Chain.chain(t.string.validate(u, c), (s) => {
            const d = new Date(s)
            return isNaN(d.getTime()) ? t.failure(u, c) : t.success(d)
        }),
    (a) => a.toISOString()
)

const PostGeniusDtoCodec = t.type({
    name: t.string,
    joinDate: DateFromString
})

export type PostGeniusDto = t.TypeOf<typeof PostGeniusDtoCodec>
export const validatePostGeniusDto = PostGeniusDtoCodec.decode

const MemberStatusBaseDtoCodec = t.type({
    genius_Id: t.string,
    issueDate: DateFromString
})

const SayNoNoDtoCodec = t.intersection([
    MemberStatusBaseDtoCodec,
    t.type({
        kind: t.literal('SayNoNo'),
        toBeReject: t.string
    }),
    t.partial({
        coolDownUntilDate: DateFromString
    })
])

const GeniusBarDtoCodec = t.intersection([
    MemberStatusBaseDtoCodec,
    t.type({
        kind: t.literal('GeniusBar'),
        resolvedIssues: t.number
    })
])

const WorkFromHomeDtoCodec = t.intersection([
    MemberStatusBaseDtoCodec,
    t.type({
        kind: t.literal('WorkFromHome')
    })
])

const PostMemberStatusDtoCodec = t.union([
    SayNoNoDtoCodec, GeniusBarDtoCodec, WorkFromHomeDtoCodec
])

export type PostSayNoNoDto = t.TypeOf<typeof SayNoNoDtoCodec>
export type PostGeniusBarDto = t.TypeOf<typeof GeniusBarDtoCodec>
export type PostWorkFromHomeDto = t.TypeOf<typeof WorkFromHomeDtoCodec>

export type PostMemberStatusDto = t.TypeOf<typeof PostMemberStatusDtoCodec>
export const validatePostMemberStatusDto = PostMemberStatusDtoCodec.decode