import {AssignedTaskDoc, GeniusDoc} from "./genius-doc";

export type GeniusView = {
    name: string,
    joinDate: Date,
    latestMemberStatus: 'WithJobs' | 'FreeTime'
    notReleasedTasks: AssignedTaskDoc[]
}

