import { prisma } from 'wasp/server'

import { updateUserProfile } from '../../../../../src/server/auth/actions.js'


export default async function (args, context) {
  return (updateUserProfile as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
    },
  })
}
