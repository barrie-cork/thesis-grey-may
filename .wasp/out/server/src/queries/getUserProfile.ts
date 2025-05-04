import { prisma } from 'wasp/server'

import { getUserProfile } from '../../../../../src/server/auth/queries.js'


export default async function (args, context) {
  return (getUserProfile as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
    },
  })
}
