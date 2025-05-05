
import { prisma } from 'wasp/server'
import {
  type UnauthenticatedOperationFor,
  createUnauthenticatedOperation,
  type AuthenticatedOperationFor,
  createAuthenticatedOperation,
} from '../wrappers.js'
import { getRawResults as getRawResults_ext } from 'wasp/src/server/resultsManager/queries'
import { getProcessedResults as getProcessedResults_ext } from 'wasp/src/server/resultsManager/queries'
import { getReviewTags as getReviewTags_ext } from 'wasp/src/server/reviewResults/queries'
import { getResultsWithTags as getResultsWithTags_ext } from 'wasp/src/server/reviewResults/queries'
import { getReportData as getReportData_ext } from 'wasp/src/server/reporting/queries'
import { getUserProfile as getUserProfile_ext } from 'wasp/src/server/auth/queries'
import { getUserSearchSessions as getUserSearchSessions_ext } from 'wasp/src/server/auth/queries'
import { getSearchSessions as getSearchSessions_ext } from 'wasp/src/server/searchStrategy/queries'
import { getSearchSession as getSearchSession_ext } from 'wasp/src/server/searchStrategy/queries'

// PRIVATE API
export type GetRawResults_ext = typeof getRawResults_ext

// PUBLIC API
export const getRawResults: AuthenticatedOperationFor<GetRawResults_ext> =
  createAuthenticatedOperation(
    getRawResults_ext,
    {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      RawSearchResult: prisma.rawSearchResult,
      SearchQuery: prisma.searchQuery,
      ProcessedResult: prisma.processedResult,
    },
  )


// PRIVATE API
export type GetProcessedResults_ext = typeof getProcessedResults_ext

// PUBLIC API
export const getProcessedResults: AuthenticatedOperationFor<GetProcessedResults_ext> =
  createAuthenticatedOperation(
    getProcessedResults_ext,
    {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      ProcessedResult: prisma.processedResult,
      RawSearchResult: prisma.rawSearchResult,
      SearchQuery: prisma.searchQuery,
      ReviewTagAssignment: prisma.reviewTagAssignment,
      ReviewTag: prisma.reviewTag,
      Note: prisma.note,
    },
  )


// PRIVATE API
export type GetReviewTags_ext = typeof getReviewTags_ext

// PUBLIC API
export const getReviewTags: AuthenticatedOperationFor<GetReviewTags_ext> =
  createAuthenticatedOperation(
    getReviewTags_ext,
    {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      ReviewTag: prisma.reviewTag,
    },
  )


// PRIVATE API
export type GetResultsWithTags_ext = typeof getResultsWithTags_ext

// PUBLIC API
export const getResultsWithTags: AuthenticatedOperationFor<GetResultsWithTags_ext> =
  createAuthenticatedOperation(
    getResultsWithTags_ext,
    {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      ProcessedResult: prisma.processedResult,
      ReviewTagAssignment: prisma.reviewTagAssignment,
      ReviewTag: prisma.reviewTag,
      Note: prisma.note,
      RawSearchResult: prisma.rawSearchResult,
      SearchQuery: prisma.searchQuery,
    },
  )


// PRIVATE API
export type GetReportData_ext = typeof getReportData_ext

// PUBLIC API
export const getReportData: AuthenticatedOperationFor<GetReportData_ext> =
  createAuthenticatedOperation(
    getReportData_ext,
    {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      SearchQuery: prisma.searchQuery,
      RawSearchResult: prisma.rawSearchResult,
      ProcessedResult: prisma.processedResult,
      ReviewTag: prisma.reviewTag,
      ReviewTagAssignment: prisma.reviewTagAssignment,
      DuplicateRelationship: prisma.duplicateRelationship,
    },
  )


// PRIVATE API
export type GetUserProfile_ext = typeof getUserProfile_ext

// PUBLIC API
export const getUserProfile: AuthenticatedOperationFor<GetUserProfile_ext> =
  createAuthenticatedOperation(
    getUserProfile_ext,
    {
      User: prisma.user,
    },
  )


// PRIVATE API
export type GetUserSearchSessions_ext = typeof getUserSearchSessions_ext

// PUBLIC API
export const getUserSearchSessions: AuthenticatedOperationFor<GetUserSearchSessions_ext> =
  createAuthenticatedOperation(
    getUserSearchSessions_ext,
    {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      SearchQuery: prisma.searchQuery,
      ProcessedResult: prisma.processedResult,
    },
  )


// PRIVATE API
export type GetSearchSessions_ext = typeof getSearchSessions_ext

// PUBLIC API
export const getSearchSessions: AuthenticatedOperationFor<GetSearchSessions_ext> =
  createAuthenticatedOperation(
    getSearchSessions_ext,
    {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      SearchQuery: prisma.searchQuery,
      ProcessedResult: prisma.processedResult,
    },
  )


// PRIVATE API
export type GetSearchSession_ext = typeof getSearchSession_ext

// PUBLIC API
export const getSearchSession: AuthenticatedOperationFor<GetSearchSession_ext> =
  createAuthenticatedOperation(
    getSearchSession_ext,
    {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      SearchQuery: prisma.searchQuery,
    },
  )

