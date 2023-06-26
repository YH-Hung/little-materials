import mongoose, { Schema, model } from 'mongoose'
import {GeniusBarDoc, GeniusDoc, MemberStatusDoc, SayNoNoDoc, WorkFromHomeDoc} from "../types/genius-doc";

const geniusSchema: Schema = new Schema<GeniusDoc>(
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
const memberStatusBaseSchema = new Schema<MemberStatusDoc>({
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
export const SayNoNoModel =
    mongoose.models.MemberStatus.discriminators?.SayNoNo as mongoose.Model<SayNoNoDoc>
    || MemberStatusBaseModel.discriminator<SayNoNoDoc>('SayNoNo', new Schema({
        toBeReject: {
            type: String,
            required: true
        },
        coolDownUntilDate: {
            type: Date
        }
    }, memberStatusOption))

export const GeniusBarModel =
    mongoose.models.MemberStatus.discriminators?.GeniusBar as mongoose.Model<GeniusBarDoc>
    || MemberStatusBaseModel.discriminator<GeniusBarDoc>('GeniusBar', new Schema({
        resolvedIssues: {
            type: Number,
            required: true
        }
    }, memberStatusOption))

export const WorkFromHomeModel =
    mongoose.models.MemberStatus.discriminators?.WorkFromHome as mongoose.Model<WorkFromHomeDoc>
    || MemberStatusBaseModel.discriminator<WorkFromHomeDoc>('WorkFromHome', new Schema({
        // empty
    }, memberStatusOption))

export default mongoose.models.Genius || model('Genius', geniusSchema)

