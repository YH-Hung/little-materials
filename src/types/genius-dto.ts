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
    id: t.string,
    name: t.string,
    joinDate: DateFromString
})

export type PostGeniusDto = t.TypeOf<typeof PostGeniusDtoCodec>
export const validatePostGeniusDto = PostGeniusDtoCodec.decode