// Wasp internally uses the types defined in this file for typing entity maps in
// operation contexts.
//
// We must explicitly tag all entities with their name to avoid issues with
// structural typing. See https://github.com/wasp-lang/wasp/pull/982 for details.
import { 
  type Entity, 
  type EntityName,
  type User,
  type SearchSession,
  type SearchQuery,
  type SearchExecution,
  type RawSearchResult,
  type ProcessedResult,
  type DuplicateRelationship,
  type ReviewTag,
  type ReviewTagAssignment,
  type ReviewAssignment,
  type Note,
  type SessionMembership,
} from 'wasp/entities'

export type _User = WithName<User, "User">
export type _SearchSession = WithName<SearchSession, "SearchSession">
export type _SearchQuery = WithName<SearchQuery, "SearchQuery">
export type _SearchExecution = WithName<SearchExecution, "SearchExecution">
export type _RawSearchResult = WithName<RawSearchResult, "RawSearchResult">
export type _ProcessedResult = WithName<ProcessedResult, "ProcessedResult">
export type _DuplicateRelationship = WithName<DuplicateRelationship, "DuplicateRelationship">
export type _ReviewTag = WithName<ReviewTag, "ReviewTag">
export type _ReviewTagAssignment = WithName<ReviewTagAssignment, "ReviewTagAssignment">
export type _ReviewAssignment = WithName<ReviewAssignment, "ReviewAssignment">
export type _Note = WithName<Note, "Note">
export type _SessionMembership = WithName<SessionMembership, "SessionMembership">

export type _Entity = 
  | _User
  | _SearchSession
  | _SearchQuery
  | _SearchExecution
  | _RawSearchResult
  | _ProcessedResult
  | _DuplicateRelationship
  | _ReviewTag
  | _ReviewTagAssignment
  | _ReviewAssignment
  | _Note
  | _SessionMembership
  | never

type WithName<E extends Entity, Name extends EntityName> = 
  E & { _entityName: Name }
