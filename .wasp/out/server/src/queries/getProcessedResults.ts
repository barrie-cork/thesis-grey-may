import { prisma } from 'wasp/server'

import { getProcessedResults } from '../../../../../src/server/resultsManager/queries.js'


export default async function (args, context) {
  return (getProcessedResults as any)(args, {
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
