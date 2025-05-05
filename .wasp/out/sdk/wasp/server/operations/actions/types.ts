import {
  type _User,
  type _SearchQuery,
  type _SearchSession,
  type _SearchExecution,
  type _RawSearchResult,
  type _ProcessedResult,
  type _DuplicateRelationship,
  type _ReviewTag,
  type _ReviewTagAssignment,
  type _Note,
  type AuthenticatedActionDefinition,
  type Payload,
} from 'wasp/server/_types'

// PUBLIC API
export type ExecuteSearchQuery<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedActionDefinition<
    [
      _User,
      _SearchQuery,
      _SearchSession,
      _SearchExecution,
      _RawSearchResult,
    ],
    Input,
    Output
  >

// PUBLIC API
export type ProcessSessionResults<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedActionDefinition<
    [
      _User,
      _SearchSession,
      _RawSearchResult,
      _ProcessedResult,
      _DuplicateRelationship,
    ],
    Input,
    Output
  >

// PUBLIC API
export type CreateReviewTag<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedActionDefinition<
    [
      _User,
      _SearchSession,
      _ReviewTag,
    ],
    Input,
    Output
  >

// PUBLIC API
export type AssignTag<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedActionDefinition<
    [
      _User,
      _ProcessedResult,
      _SearchSession,
      _ReviewTagAssignment,
      _ReviewTag,
    ],
    Input,
    Output
  >

// PUBLIC API
export type CreateNote<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedActionDefinition<
    [
      _User,
      _ProcessedResult,
      _SearchSession,
      _Note,
    ],
    Input,
    Output
  >

// PUBLIC API
export type ExportResults<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedActionDefinition<
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
export type UpdateUserProfile<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedActionDefinition<
    [
      _User,
    ],
    Input,
    Output
  >

// PUBLIC API
export type ChangePassword<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedActionDefinition<
    [
      _User,
    ],
    Input,
    Output
  >

// PUBLIC API
export type CreateSearchSession<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedActionDefinition<
    [
      _User,
      _SearchSession,
    ],
    Input,
    Output
  >

