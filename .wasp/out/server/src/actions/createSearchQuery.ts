import { prisma } from 'wasp/server'

import { createSearchQuery } from '../../../../../src/server/searchStrategy/actions.js'


export default async function (args, context) {
  return (createSearchQuery as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      SearchQuery: prisma.searchQuery,
    },
  })
}
