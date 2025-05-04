import { prisma } from 'wasp/server'

import { getReportData } from '../../../../../src/server/reporting/queries.js'


export default async function (args, context) {
  return (getReportData as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      SearchQuery: prisma.searchQuery,
      RawSearchResult: prisma.rawSearchResult,
      ProcessedResult: prisma.processedResult,
      ReviewTag: prisma.reviewTag,
      ReviewTagAssignment: prisma.reviewTagAssignment,
      DuplicateRelationship: prisma.duplicateRelationship,
    },
  })
}
