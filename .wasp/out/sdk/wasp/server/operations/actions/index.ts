
import { prisma } from 'wasp/server'
import {
  type UnauthenticatedOperationFor,
  createUnauthenticatedOperation,
  type AuthenticatedOperationFor,
  createAuthenticatedOperation,
} from '../wrappers.js'
import { executeSearchQuery as executeSearchQuery_ext } from 'wasp/src/server/serpExecution/actions'
import { processSessionResults as processSessionResults_ext } from 'wasp/src/server/resultsManager/actions'
import { createReviewTag as createReviewTag_ext } from 'wasp/src/server/reviewResults/actions'
import { assignTag as assignTag_ext } from 'wasp/src/server/reviewResults/actions'
import { createNote as createNote_ext } from 'wasp/src/server/reviewResults/actions'
import { exportResults as exportResults_ext } from 'wasp/src/server/reporting/actions'
import { updateUserProfile as updateUserProfile_ext } from 'wasp/src/server/auth/actions'
import { changePassword as changePassword_ext } from 'wasp/src/server/auth/actions'
import { createSearchSession as createSearchSession_ext } from 'wasp/src/server/searchStrategy/actions'

// PRIVATE API
export type ExecuteSearchQuery_ext = typeof executeSearchQuery_ext

// PUBLIC API
export const executeSearchQuery: AuthenticatedOperationFor<ExecuteSearchQuery_ext> =
  createAuthenticatedOperation(
    executeSearchQuery_ext,
    {
      User: prisma.user,
      SearchQuery: prisma.searchQuery,
      SearchSession: prisma.searchSession,
      SearchExecution: prisma.searchExecution,
      RawSearchResult: prisma.rawSearchResult,
    },
  )

// PRIVATE API
export type ProcessSessionResults_ext = typeof processSessionResults_ext

// PUBLIC API
export const processSessionResults: AuthenticatedOperationFor<ProcessSessionResults_ext> =
  createAuthenticatedOperation(
    processSessionResults_ext,
    {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      RawSearchResult: prisma.rawSearchResult,
      ProcessedResult: prisma.processedResult,
      DuplicateRelationship: prisma.duplicateRelationship,
    },
  )

// PRIVATE API
export type CreateReviewTag_ext = typeof createReviewTag_ext

// PUBLIC API
export const createReviewTag: AuthenticatedOperationFor<CreateReviewTag_ext> =
  createAuthenticatedOperation(
    createReviewTag_ext,
    {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      ReviewTag: prisma.reviewTag,
    },
  )

// PRIVATE API
export type AssignTag_ext = typeof assignTag_ext

// PUBLIC API
export const assignTag: AuthenticatedOperationFor<AssignTag_ext> =
  createAuthenticatedOperation(
    assignTag_ext,
    {
      User: prisma.user,
      ProcessedResult: prisma.processedResult,
      SearchSession: prisma.searchSession,
      ReviewTagAssignment: prisma.reviewTagAssignment,
      ReviewTag: prisma.reviewTag,
    },
  )

// PRIVATE API
export type CreateNote_ext = typeof createNote_ext

// PUBLIC API
export const createNote: AuthenticatedOperationFor<CreateNote_ext> =
  createAuthenticatedOperation(
    createNote_ext,
    {
      User: prisma.user,
      ProcessedResult: prisma.processedResult,
      SearchSession: prisma.searchSession,
      Note: prisma.note,
    },
  )

// PRIVATE API
export type ExportResults_ext = typeof exportResults_ext

// PUBLIC API
export const exportResults: AuthenticatedOperationFor<ExportResults_ext> =
  createAuthenticatedOperation(
    exportResults_ext,
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
export type UpdateUserProfile_ext = typeof updateUserProfile_ext

// PUBLIC API
export const updateUserProfile: AuthenticatedOperationFor<UpdateUserProfile_ext> =
  createAuthenticatedOperation(
    updateUserProfile_ext,
    {
      User: prisma.user,
    },
  )

// PRIVATE API
export type ChangePassword_ext = typeof changePassword_ext

// PUBLIC API
export const changePassword: AuthenticatedOperationFor<ChangePassword_ext> =
  createAuthenticatedOperation(
    changePassword_ext,
    {
      User: prisma.user,
    },
  )

// PRIVATE API
export type CreateSearchSession_ext = typeof createSearchSession_ext

// PUBLIC API
export const createSearchSession: AuthenticatedOperationFor<CreateSearchSession_ext> =
  createAuthenticatedOperation(
    createSearchSession_ext,
    {
      User: prisma.user,
      SearchSession: prisma.searchSession,
    },
  )
