import { prisma } from 'wasp/server'

import { updateSearchQuery } from '../../../../../src/server/searchStrategy/actions.js'


export default async function (args, context) {
  return (updateSearchQuery as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      SearchQuery: prisma.searchQuery,
    },
  })
}
