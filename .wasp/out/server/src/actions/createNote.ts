import { prisma } from 'wasp/server'

import { createNote } from '../../../../../src/server/reviewResults/actions.js'


export default async function (args, context) {
  return (createNote as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      ProcessedResult: prisma.processedResult,
      SearchSession: prisma.searchSession,
      Note: prisma.note,
    },
  })
}
