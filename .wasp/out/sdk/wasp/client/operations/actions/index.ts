import { type ActionFor, createAction } from './core'
import { ExecuteSearchQuery_ext } from 'wasp/server/operations/actions'
import { ProcessSessionResults_ext } from 'wasp/server/operations/actions'
import { CreateReviewTag_ext } from 'wasp/server/operations/actions'
import { AssignTag_ext } from 'wasp/server/operations/actions'
import { CreateNote_ext } from 'wasp/server/operations/actions'
import { ExportResults_ext } from 'wasp/server/operations/actions'
import { UpdateUserProfile_ext } from 'wasp/server/operations/actions'
import { ChangePassword_ext } from 'wasp/server/operations/actions'
import { CreateSearchSession_ext } from 'wasp/server/operations/actions'

// PUBLIC API
export const executeSearchQuery: ActionFor<ExecuteSearchQuery_ext> = createAction<ExecuteSearchQuery_ext>(
  'operations/execute-search-query',
  ['User', 'SearchQuery', 'SearchSession', 'SearchExecution', 'RawSearchResult'],
)

// PUBLIC API
export const processSessionResults: ActionFor<ProcessSessionResults_ext> = createAction<ProcessSessionResults_ext>(
  'operations/process-session-results',
  ['User', 'SearchSession', 'RawSearchResult', 'ProcessedResult', 'DuplicateRelationship'],
)

// PUBLIC API
export const createReviewTag: ActionFor<CreateReviewTag_ext> = createAction<CreateReviewTag_ext>(
  'operations/create-review-tag',
  ['User', 'SearchSession', 'ReviewTag'],
)

// PUBLIC API
export const assignTag: ActionFor<AssignTag_ext> = createAction<AssignTag_ext>(
  'operations/assign-tag',
  ['User', 'ProcessedResult', 'SearchSession', 'ReviewTagAssignment', 'ReviewTag'],
)

// PUBLIC API
export const createNote: ActionFor<CreateNote_ext> = createAction<CreateNote_ext>(
  'operations/create-note',
  ['User', 'ProcessedResult', 'SearchSession', 'Note'],
)

// PUBLIC API
export const exportResults: ActionFor<ExportResults_ext> = createAction<ExportResults_ext>(
  'operations/export-results',
  ['User', 'SearchSession', 'ProcessedResult', 'RawSearchResult', 'SearchQuery', 'ReviewTagAssignment', 'ReviewTag', 'Note'],
)

// PUBLIC API
export const updateUserProfile: ActionFor<UpdateUserProfile_ext> = createAction<UpdateUserProfile_ext>(
  'operations/update-user-profile',
  ['User'],
)

// PUBLIC API
export const changePassword: ActionFor<ChangePassword_ext> = createAction<ChangePassword_ext>(
  'operations/change-password',
  ['User'],
)

// PUBLIC API
export const createSearchSession: ActionFor<CreateSearchSession_ext> = createAction<CreateSearchSession_ext>(
  'operations/create-search-session',
  ['User', 'SearchSession'],
)
