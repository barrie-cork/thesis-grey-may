import { prisma } from 'wasp/server'

import { exportResults } from '../../../../../src/server/reporting/actions.js'


export default async function (args, context) {
  return (exportResults as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      ProcessedResult: prisma.processedResult,
      RawSearchResult: prisma.rawSearchResult,
      SearchQuery: prisma.searchQuery,
      ReviewTagAssignment: prisma.reviewTagAssignment,
      ReviewTag: prisma.reviewTag,
      Note: prisma.note,
    },
  })
}
