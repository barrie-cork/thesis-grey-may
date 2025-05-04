import { prisma } from 'wasp/server'

import { createReviewTag } from '../../../../../src/server/reviewResults/actions.js'


export default async function (args, context) {
  return (createReviewTag as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      ReviewTag: prisma.reviewTag,
    },
  })
}
