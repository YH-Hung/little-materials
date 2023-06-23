import mongoose, { Schema, model } from 'mongoose'

const geniusSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        joinDate: {
            type: Date,
            required: true
        },
        latestMemberStatus: { type: Schema.Types.ObjectId, ref: 'MemberStatus'}
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false
        }
    }
)

const memberStatusOption = { discriminatorKey: 'kind', timestamps: true, toJSON: { versionKey: false } }
const memberStatusBaseSchema = new Schema({
    genius: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Genius'},
    issueTime: {
        type: Date,
        required: true
    }
}, memberStatusOption)

export const MemberStatusBaseModel = mongoose.models.MemberStatus || model('MemberStatus', memberStatusBaseSchema)
export const SayNoNoModel = MemberStatusBaseModel.discriminator('SayNoNo', new Schema({
    toBeReject: {
        type: String,
        required: true
    },
    coolDownUntilDate: {
        type: Date
    }
}, memberStatusOption))

export const GeniusBarModel = MemberStatusBaseModel.discriminator('GeniusBar', new Schema({
    resolvedIssues: {
        type: Number,
        required: true
    }
}, memberStatusOption))

export const WorkFromHomeModel = MemberStatusBaseModel.discriminator('WorkFromHome', new Schema({
    // empty
}, memberStatusOption))

export default mongoose.models.Genius || model('Genius', geniusSchema)

