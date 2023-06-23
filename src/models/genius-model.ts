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

const memberStatusSchema = new Schema({
    genius: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Genius'},
    memberStatus: {
        type: String,
        enum: ['SayNoNo', 'GeniusBar', 'WorkFromHome'],
        required: true
    },
    issueTime: {
        type: Date,
        required: true
    }
},
    {
        timestamps: true,
        toJSON: {
            versionKey: false
        }
    })

export default mongoose.models.Genius || model('Genius', geniusSchema)
export const MemberStatusModel = mongoose.models.MemberStatus || model('MemberStatus', memberStatusSchema)