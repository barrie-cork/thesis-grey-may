import { prisma } from 'wasp/server'

import { getSearchSession } from '../../../../../src/server/searchStrategy/queries'


export default async function (args, context) {
  return (getSearchSession as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      SearchQuery: prisma.searchQuery,
    },
  })
}
