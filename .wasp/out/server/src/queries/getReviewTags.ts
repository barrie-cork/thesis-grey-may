import { prisma } from 'wasp/server'

import { getReviewTags } from '../../../../../src/server/reviewResults/queries.js'


export default async function (args, context) {
  return (getReviewTags as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      ReviewTag: prisma.reviewTag,
    },
  })
}
