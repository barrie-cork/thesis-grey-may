import {
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
} from "@prisma/client"

export {
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
  type Auth,
  type AuthIdentity,
} from "@prisma/client"

export type Entity = 
  | User
  | SearchSession
  | SearchQuery
  | SearchExecution
  | RawSearchResult
  | ProcessedResult
  | DuplicateRelationship
  | ReviewTag
  | ReviewTagAssignment
  | ReviewAssignment
  | Note
  | never

export type EntityName = 
  | "User"
  | "SearchSession"
  | "SearchQuery"
  | "SearchExecution"
  | "RawSearchResult"
  | "ProcessedResult"
  | "DuplicateRelationship"
  | "ReviewTag"
  | "ReviewTagAssignment"
  | "ReviewAssignment"
  | "Note"
  | never
