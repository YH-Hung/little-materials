import mongoose, {Schema, model} from 'mongoose'
import {
    AssignedTaskDoc,
    GeniusBarDoc,
    GeniusDoc,
    MemberStatusDoc,
    SayNoNoDoc,
    TaskReleaseDoc,
    WorkFromHomeDoc
} from "../types/genius-doc";

const memberStatusOption = { discriminatorKey: 'kind' }
const memberStatusBaseSchema = new Schema<MemberStatusDoc>({
    issueTime: { type: Date, required: true }
}, memberStatusOption)

const releaseSchema = new Schema<TaskReleaseDoc>({
    releaseAt: { type: Date, required: true },
    reason: { type: String }
})

const assignedTaskSchema = new Schema<AssignedTaskDoc>({
    taskName: { type: String, required: true },
    issueTime: { type: Date, required: true },
    release: {
        type: releaseSchema,
        required: false
    }
})

const geniusSchema: Schema = new Schema<GeniusDoc>({
    name: { type: String, required: true },
    joinDate: { type: Date, required: true },
    memberStatuses: [memberStatusBaseSchema],
    assignedTasks: [assignedTaskSchema]
})

// For SubDocument discriminator, some mongoose typescript issues here,
// MANUALLY casting path to SubDocument is required to suppress error when call discriminator method.
// ref: https://github.com/Automattic/mongoose/issues/10435
const memberStatusPath = geniusSchema.path<Schema.Types.Subdocument>('memberStatuses')
memberStatusPath.discriminator<SayNoNoDoc>('SayNoNo', new Schema({
    toBeReject: { type: String, required: true },
    coolDownUntilDate: { type: Date }
}))

memberStatusPath.discriminator<GeniusBarDoc>('GeniusBar', new Schema({
    resolvedIssues: { type: Number, required: true }
}, memberStatusOption))


memberStatusPath.discriminator<WorkFromHomeDoc>('WorkFromHome', new Schema({
}, memberStatusOption))


export default mongoose.models.Genius || model('Genius', geniusSchema)

