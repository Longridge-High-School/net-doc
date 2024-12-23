import {beforeAll} from 'vitest'

import {getPrisma} from '~/lib/prisma.server'

beforeAll(async () => {
  const prisma = getPrisma()

  const aCLEntry = await prisma.aCLEntry.findMany()

  //await prisma.aCLEntry.deleteMany({})
  //await prisma.aCL.deleteMany({})
})
