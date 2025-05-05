import { prisma } from 'wasp/server'

import { createSearchSession } from '../../../../../src/server/searchStrategy/actions'


export default async function (args, context) {
  return (createSearchSession as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      SearchSession: prisma.searchSession,
    },
  })
}
