import { prisma } from 'wasp/server'

import { executeSearchQuery } from '../../../../../src/server/serpExecution/actions.js'


export default async function (args, context) {
  return (executeSearchQuery as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      SearchQuery: prisma.searchQuery,
      SearchSession: prisma.searchSession,
      SearchExecution: prisma.searchExecution,
      RawSearchResult: prisma.rawSearchResult,
    },
  })
}
