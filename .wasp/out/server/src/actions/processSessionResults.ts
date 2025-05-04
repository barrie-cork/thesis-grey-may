import { prisma } from 'wasp/server'

import { processSessionResults } from '../../../../../src/server/resultsManager/actions.js'


export default async function (args, context) {
  return (processSessionResults as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      SearchSession: prisma.searchSession,
      RawSearchResult: prisma.rawSearchResult,
      ProcessedResult: prisma.processedResult,
      DuplicateRelationship: prisma.duplicateRelationship,
    },
  })
}
