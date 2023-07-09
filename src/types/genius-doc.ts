import mongoose from "mongoose";

export interface GeniusDoc {
    _id: mongoose.Types.ObjectId,
    name: string,
    joinDate: Date,
    memberStatuses: MemberStatusDoc[]
}

export interface MemberStatusDoc {
    kind: string
    issueTime: Date
}

export interface SayNoNoDoc extends MemberStatusDoc {
    toBeReject: string,
    coolDownUntilDate?: Date
}

export interface GeniusBarDoc extends MemberStatusDoc {
    resolvedIssues: number
}

export interface WorkFromHomeDoc extends MemberStatusDoc {
    assignedTasks: AssignedTaskDoc[]
}

export interface AssignedTaskDoc {
    issueTime: Date
    taskName: string
    release?: TaskReleaseDoc,
}

export interface TaskReleaseDoc {
    releaseAt: Date
    reason?: string
}