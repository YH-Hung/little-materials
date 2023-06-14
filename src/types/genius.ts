import {iso, Newtype, prism} from "newtype-ts";
import * as O from 'fp-ts/Option'
import {flow} from "fp-ts/function";

const isNonEmptyString = (str: string) => str !== undefined && str.trim() !== ''
// const isValidDate = flow(Date.parse, isNaN, (b: boolean) => !b)

// Genius Id
export interface GeniusId extends Newtype<{ readonly GeniusId: unique symbol }, string> {}
const prismGeniusId = prism<GeniusId>(isNonEmptyString)
const isoGeniusId = iso<GeniusId>()
export const geniusIdOf: (id: string) => O.Option<GeniusId>  = prismGeniusId.getOption
export const fromGeniusId: (id: GeniusId) => string = prismGeniusId.reverseGet
export const unsafeGeniusIdOf: (id: string) => GeniusId = isoGeniusId.wrap

// Genius Name
export interface GeniusName extends Newtype<{ readonly GeniusName: unique symbol }, string> {}
const prismGeniusName = prism<GeniusName>(isNonEmptyString)
const isoGeniusName = iso<GeniusName>()
export const geniusNameOf = prismGeniusName.getOption
export const fromGeniusName = prismGeniusName.reverseGet
export const unsafeGeniusNameOf = isoGeniusName.wrap

// Join Date
interface GeniusJoinDate extends Newtype<{ readonly GeniusJoinDate: unique symbol }, Date> {}
const isoGeniusJoinDate = iso<GeniusJoinDate>()
export const geniusJoinDateOf = isoGeniusJoinDate.wrap
export const fromGeniusJoinDate = isoGeniusJoinDate.unwrap

export type GeniusInfo = Readonly<{ geniusName: GeniusName, geniusJoinDate: GeniusJoinDate }>
export const geniusInfoOf = (geniusName: GeniusName) => (geniusJoinDate: GeniusJoinDate) =>
    ({geniusName, geniusJoinDate})

export type Genius = Readonly<{ geniusId: GeniusId, geniusName: GeniusName, geniusJoinDate: GeniusJoinDate }>
export const geniusOf = (geniusId: GeniusId) => (geniusName: GeniusName) => (geniusJoinDate: GeniusJoinDate) =>
    ({geniusId, geniusName, geniusJoinDate})

// Member status
export type ToBeOnBoarder = { _tag: 'ToBeOnBoarder'}
export type GeniusBar = { _tag: 'GeniusBar'}
export type BootCamp = { _tag: 'BootCamp'}
export type MemberStatus = ToBeOnBoarder | GeniusBar | BootCamp

export interface MemberStateIssueDate extends Newtype<{ readonly MemberStateIssueDate: unique symbol }, string> {}
const isoMemberStateIssueDate = iso<MemberStateIssueDate>()
export const memberStatusIssueDateOf = isoMemberStateIssueDate.wrap
export const fromMemberStatusDate = isoMemberStateIssueDate.unwrap

export type MemberStatusRecord = Readonly<{
    geniusId: GeniusId
    memberStatus: MemberStatus
    issueDate: MemberStateIssueDate
}>
export const memberStateRecordOf = (geniusId: GeniusId) => (memberStatus: MemberStatus) => (issueDate: MemberStateIssueDate) =>
    ({geniusId, memberStatus, issueDate})

export type GeniusView = Readonly<{ geniusId: GeniusId, geniusName: GeniusName, geniusJoinDate: GeniusJoinDate, memberStatus: MemberStatus }>
export const geniusViewOf = (genius: Genius) => (memberStatus: MemberStatus) =>
    ({...genius, memberStatus})