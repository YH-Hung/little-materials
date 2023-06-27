import mongoose, {Schema, model} from 'mongoose'
import {
    AssignedTaskDoc,
    GeniusBarDoc,
    GeniusDoc,
    MemberStatusDoc,
    SayNoNoDoc,
    TaskRelease,
    WorkFromHomeDoc
} from "../types/genius-doc";

const geniusSchema: Schema = new Schema<GeniusDoc>({
    name: { type: String, required: true },
    joinDate: { type: Date, required: true },
    latestMemberStatus: { type: Schema.Types.ObjectId, ref: 'MemberStatus'},
}, {
    timestamps: true,
    toJSON: {
        versionKey: false
    }
})

const memberStatusOption = { discriminatorKey: 'kind', timestamps: true, toJSON: { versionKey: false } }
const memberStatusBaseSchema = new Schema<MemberStatusDoc>({
    genius: { type: Schema.Types.ObjectId, required: true, ref: 'Genius'},
    issueTime: { type: Date, required: true }
}, memberStatusOption)

export const MemberStatusBaseModel = mongoose.models.MemberStatus || model('MemberStatus', memberStatusBaseSchema)
export const SayNoNoModel =
    mongoose.models.MemberStatus.discriminators?.SayNoNo as mongoose.Model<SayNoNoDoc>
    || MemberStatusBaseModel.discriminator<SayNoNoDoc>('SayNoNo', new Schema({
        toBeReject: { type: String, required: true },
        coolDownUntilDate: { type: Date }
    }, memberStatusOption))

export const GeniusBarModel =
    mongoose.models.MemberStatus.discriminators?.GeniusBar as mongoose.Model<GeniusBarDoc>
    || MemberStatusBaseModel.discriminator<GeniusBarDoc>('GeniusBar', new Schema({
        resolvedIssues: { type: Number, required: true }
    }, memberStatusOption))

export const WorkFromHomeModel =
    mongoose.models.MemberStatus.discriminators?.WorkFromHome as mongoose.Model<WorkFromHomeDoc>
    || MemberStatusBaseModel.discriminator<WorkFromHomeDoc>('WorkFromHome', new Schema({
        assignedTasks: [{ type: Schema.Types.ObjectId, ref: 'AssignedTask'}]
    }, memberStatusOption))

const releaseSchema = new Schema<TaskRelease>({
    releaseAt: { type: Date, required: true },
    reason: { type: String }
})

const assignedTaskSchema = new Schema<AssignedTaskDoc>({
    taskName: { type: String, required: true },
    memberStatus: { type: Schema.Types.ObjectId, required: true, ref: 'MemberStatus'},
    issueTime: { type: Date, required: true },
    release: {
        type: releaseSchema,
        required: false
    }
})

export const AssignedTaskModel = mongoose.models.AssignedTask || model<AssignedTaskDoc>('AssignedTask', assignedTaskSchema)

export default mongoose.models.Genius || model('Genius', geniusSchema)

