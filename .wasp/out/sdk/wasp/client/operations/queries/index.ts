import { type QueryFor, createQuery } from './core'
import { GetRawResults_ext } from 'wasp/server/operations/queries'
import { GetProcessedResults_ext } from 'wasp/server/operations/queries'
import { GetReviewTags_ext } from 'wasp/server/operations/queries'
import { GetResultsWithTags_ext } from 'wasp/server/operations/queries'
import { GetReportData_ext } from 'wasp/server/operations/queries'
import { GetUserProfile_ext } from 'wasp/server/operations/queries'
import { GetUserSearchSessions_ext } from 'wasp/server/operations/queries'
import { GetSearchSessions_ext } from 'wasp/server/operations/queries'
import { GetSearchSession_ext } from 'wasp/server/operations/queries'

// PUBLIC API
export const getRawResults: QueryFor<GetRawResults_ext> = createQuery<GetRawResults_ext>(
  'operations/get-raw-results',
  ['User', 'SearchSession', 'RawSearchResult', 'SearchQuery', 'ProcessedResult'],
)

// PUBLIC API
export const getProcessedResults: QueryFor<GetProcessedResults_ext> = createQuery<GetProcessedResults_ext>(
  'operations/get-processed-results',
  ['User', 'SearchSession', 'ProcessedResult', 'RawSearchResult', 'SearchQuery', 'ReviewTagAssignment', 'ReviewTag', 'Note'],
)

// PUBLIC API
export const getReviewTags: QueryFor<GetReviewTags_ext> = createQuery<GetReviewTags_ext>(
  'operations/get-review-tags',
  ['User', 'SearchSession', 'ReviewTag'],
)

// PUBLIC API
export const getResultsWithTags: QueryFor<GetResultsWithTags_ext> = createQuery<GetResultsWithTags_ext>(
  'operations/get-results-with-tags',
  ['User', 'SearchSession', 'ProcessedResult', 'ReviewTagAssignment', 'ReviewTag', 'Note', 'RawSearchResult', 'SearchQuery'],
)

// PUBLIC API
export const getReportData: QueryFor<GetReportData_ext> = createQuery<GetReportData_ext>(
  'operations/get-report-data',
  ['User', 'SearchSession', 'SearchQuery', 'RawSearchResult', 'ProcessedResult', 'ReviewTag', 'ReviewTagAssignment', 'DuplicateRelationship'],
)

// PUBLIC API
export const getUserProfile: QueryFor<GetUserProfile_ext> = createQuery<GetUserProfile_ext>(
  'operations/get-user-profile',
  ['User'],
)

// PUBLIC API
export const getUserSearchSessions: QueryFor<GetUserSearchSessions_ext> = createQuery<GetUserSearchSessions_ext>(
  'operations/get-user-search-sessions',
  ['User', 'SearchSession', 'SearchQuery', 'ProcessedResult'],
)

// PUBLIC API
export const getSearchSessions: QueryFor<GetSearchSessions_ext> = createQuery<GetSearchSessions_ext>(
  'operations/get-search-sessions',
  ['User', 'SearchSession', 'SearchQuery', 'ProcessedResult'],
)

// PUBLIC API
export const getSearchSession: QueryFor<GetSearchSession_ext> = createQuery<GetSearchSession_ext>(
  'operations/get-search-session',
  ['User', 'SearchSession', 'SearchQuery', 'ProcessedResult'],
)

// PRIVATE API (used in SDK)
export { buildAndRegisterQuery } from './core'
