import { prisma } from 'wasp/server'

import { getUserSearchSessions } from '../../../../../src/server/auth/queries.js'


export default async function (args, context) {
  return (getUserSearchSessions as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      SearchQuery: prisma.searchQuery,
      ProcessedResult: prisma.processedResult,
    },
  })
}
