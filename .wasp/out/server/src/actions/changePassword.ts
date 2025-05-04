import { prisma } from 'wasp/server'

import { changePassword } from '../../../../../src/server/auth/actions.js'


export default async function (args, context) {
  return (changePassword as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
    },
  })
}
