import * as A from "fp-ts/Array"
import * as O from "fp-ts/Option"
import {GeniusDoc} from "../types/genius-doc";
import {pipe} from "fp-ts/function";

import * as repo from "../repos/genius-repo"
import {GeniusView} from "../types/genius-view";

const geniusViewOf: (doc: GeniusDoc) => GeniusView = (doc)=> pipe(
    {
        latestStatus: repo.aggregateCurrentStatus(doc),
        notReleasedTasks: pipe(
            doc.assignedTasks,
            A.filter(t => pipe(t.release, O.fromNullable, O.isNone))
        )
    },
    (san) => ({
        name: doc.name,
        joinDate: doc.joinDate,
        latestMemberStatus: pipe(san.latestStatus, O.match(
            () => 'FreeTime',
            (s) =>
                s.kind === 'WorkFromHome' && san.notReleasedTasks.length > 0
                    ? 'WithJobs' : 'FreeTime'
        )),
        notReleasedTasks: san.notReleasedTasks
    })
)

export const convertToViews = A.map(geniusViewOf)