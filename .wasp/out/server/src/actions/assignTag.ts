import { prisma } from 'wasp/server'

import { assignTag } from '../../../../../src/server/reviewResults/actions.js'


export default async function (args, context) {
  return (assignTag as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      ProcessedResult: prisma.processedResult,
      SearchSession: prisma.searchSession,
      ReviewTagAssignment: prisma.reviewTagAssignment,
      ReviewTag: prisma.reviewTag,
    },
  })
}
