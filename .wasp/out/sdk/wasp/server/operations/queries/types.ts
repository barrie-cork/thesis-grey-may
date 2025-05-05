
import {
  type _User,
  type _SearchSession,
  type _RawSearchResult,
  type _SearchQuery,
  type _ProcessedResult,
  type _ReviewTagAssignment,
  type _ReviewTag,
  type _Note,
  type _DuplicateRelationship,
  type AuthenticatedQueryDefinition,
  type Payload,
} from 'wasp/server/_types'

// PUBLIC API
export type GetRawResults<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _User,
      _SearchSession,
      _RawSearchResult,
      _SearchQuery,
      _ProcessedResult,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetProcessedResults<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _User,
      _SearchSession,
      _ProcessedResult,
      _RawSearchResult,
      _SearchQuery,
      _ReviewTagAssignment,
      _ReviewTag,
      _Note,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetReviewTags<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _User,
      _SearchSession,
      _ReviewTag,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetResultsWithTags<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _User,
      _SearchSession,
      _ProcessedResult,
      _ReviewTagAssignment,
      _ReviewTag,
      _Note,
      _RawSearchResult,
      _SearchQuery,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetReportData<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _User,
      _SearchSession,
      _SearchQuery,
      _RawSearchResult,
      _ProcessedResult,
      _ReviewTag,
      _ReviewTagAssignment,
      _DuplicateRelationship,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetUserProfile<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _User,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetUserSearchSessions<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _User,
      _SearchSession,
      _SearchQuery,
      _ProcessedResult,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetSearchSessions<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _User,
      _SearchSession,
      _SearchQuery,
      _ProcessedResult,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetSearchSession<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _User,
      _SearchSession,
      _SearchQuery,
    ],
    Input,
    Output
  >

