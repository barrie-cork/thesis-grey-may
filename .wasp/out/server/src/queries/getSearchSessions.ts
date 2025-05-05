import { prisma } from 'wasp/server'

import { getSearchSessions } from '../../../../../src/server/searchStrategy/queries'


export default async function (args, context) {
  return (getSearchSessions as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      SearchQuery: prisma.searchQuery,
      ProcessedResult: prisma.processedResult,
    },
  })
}
