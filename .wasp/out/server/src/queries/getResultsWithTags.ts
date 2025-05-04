import { prisma } from 'wasp/server'

import { getResultsWithTags } from '../../../../../src/server/reviewResults/queries.js'


export default async function (args, context) {
  return (getResultsWithTags as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      ProcessedResult: prisma.processedResult,
      ReviewTagAssignment: prisma.reviewTagAssignment,
      ReviewTag: prisma.reviewTag,
      Note: prisma.note,
      RawSearchResult: prisma.rawSearchResult,
      SearchQuery: prisma.searchQuery,
    },
  })
}
