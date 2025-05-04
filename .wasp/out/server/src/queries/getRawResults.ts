import { prisma } from 'wasp/server'

import { getRawResults } from '../../../../../src/server/resultsManager/queries.js'


export default async function (args, context) {
  return (getRawResults as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      RawSearchResult: prisma.rawSearchResult,
      SearchQuery: prisma.searchQuery,
      ProcessedResult: prisma.processedResult,
    },
  })
}
