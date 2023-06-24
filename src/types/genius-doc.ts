import mongoose from "mongoose";

export interface GeniusDoc {
    _id: mongoose.Types.ObjectId,
    name: string,
    joinDate: Date,
    latestMemberStatus: mongoose.Types.ObjectId
}

export interface MemberStatusDoc {
    _id: mongoose.Types.ObjectId,
    genius: mongoose.Types.ObjectId,
    issueTime: Date
}

export interface SayNoNoDoc extends MemberStatusDoc {
    toBeReject: string,
    coolDownUntilDate?: Date
}

export interface GeniusBarDoc extends MemberStatusDoc {
    resolvedIssues: number
}

export interface WorkFromHomeDoc extends MemberStatusDoc {}